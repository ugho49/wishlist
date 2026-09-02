import type { ConfigType } from '@nestjs/config';

import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Job, type JobsOptions, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { PinoLogger } from 'pino-nestjs';
import { Store, storage } from 'pino-nestjs/dist/storage';

import queueConfig from './queue.config';
import { QueueProcessorBase } from './queue.type';
import { QueueName, type QueueNamePayloadMap } from './queues.definitions';

const DEFAULT_REMOVE_ON_COMPLETE_AGE = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_REMOVE_ON_FAIL_AGE = 60 * 60 * 24 * 90; // 90 days
const DEFAULT_NUMBER_OF_ATTEMPTS = 5;

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly REMOVE_ON_COMPLETE_AGE = DEFAULT_REMOVE_ON_COMPLETE_AGE;
  private readonly REMOVE_ON_FAIL_AGE = DEFAULT_REMOVE_ON_FAIL_AGE;
  private readonly NUMBER_OF_ATTEMPTS = DEFAULT_NUMBER_OF_ATTEMPTS;

  private readonly logger = new Logger(QueueService.name);
  private readonly workers: Worker[] = [];
  private readonly queues: Map<QueueName, Queue> = new Map();
  private readonly connection: Redis;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly pinoLogger: PinoLogger,
    @Inject(queueConfig.KEY) private readonly config: ConfigType<typeof queueConfig>,
  ) {
    this.connection = new Redis({
      host: this.config.valkey.host,
      port: this.config.valkey.port,
      password: this.config.valkey.password || undefined,
      db: this.config.valkey.db,
      maxRetriesPerRequest: null,
    });
  }

  async addJob<T extends QueueName>(
    queueName: T,
    jobName: string,
    payload: QueueNamePayloadMap[T],
    options?: JobsOptions,
  ) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.add(jobName, payload, options);
  }

  async onModuleInit() {
    const allProviders = await this.discoveryService.providers(
      provider => provider.instance instanceof QueueProcessorBase,
    );

    for (const queueName of Object.values(QueueName)) {
      const matchingProcessors = allProviders.filter(
        provider => (provider.instance as QueueProcessorBase).queueName === queueName,
      );

      if (matchingProcessors.length === 0) {
        throw new Error(`No queue processor found for queue ${queueName}`);
      }

      if (matchingProcessors.length > 1) {
        throw new Error(`Multiple queue processors found for queue ${queueName}`);
      }

      const discovered = matchingProcessors[0];
      if (!discovered) {
        throw new Error(`No queue processor found for queue ${queueName}`);
      }

      const processor = discovered.instance as QueueProcessorBase;

      const worker = this.createWorker(queueName, discovered.name, processor);
      this.workers.push(worker);

      const queue = this.createQueue(queueName);
      this.queues.set(queueName, queue);

      if (processor.options.repeat) {
        if (!this.config.scheduledJobsEnabled) {
          this.logger.log(`Scheduled jobs are not enabled, skipping repeatable job for queue ${queueName}`);
          continue;
        }

        await queue.upsertJobScheduler(queueName, processor.options.repeat, {
          name: queueName,
          data: {},
        });
        this.logger.log(`Registered repeatable job for queue ${queueName}`);
      }
    }

    this.startAllWorkers();
  }

  async onModuleDestroy() {
    await this.stopAllWorkers();
    await Promise.all([...this.queues.values()].map(queue => queue.close()));
    this.connection.disconnect();
  }

  private startAllWorkers() {
    this.logger.log('Starting all workers');
    for (const worker of this.workers) {
      worker.run();
    }
    this.logger.log('All workers started');
  }

  private async stopAllWorkers() {
    this.logger.log('Stopping all workers');
    await Promise.all(this.workers.map(worker => worker.close()));
    this.logger.log('All workers are stopped');
  }

  private createWorker(queueName: QueueName, processorName: string, processor: QueueProcessorBase) {
    return new Worker(
      queueName,
      async (job: Job<QueueNamePayloadMap[QueueName]>) => {
        await storage.run(new Store(PinoLogger.root.child({})), async () => {
          const messageId = Bun.randomUUIDv7();
          const resourceName = `${processorName}.process`;

          this.pinoLogger.assign({
            messageId,
            job: {
              id: job.id,
              name: job.name,
              handler: resourceName,
              queueName,
            },
          });

          this.logger.log(`Message ${messageId} received, forwarding to handlers`, {
            payload: job.data,
          });

          try {
            await processor.process(job);
          } catch (error) {
            this.logger.error(`Message ${messageId} rejected due to handler error.`, { error });
            throw error;
          }
        });
      },
      {
        connection: this.connection,
        concurrency: processor.options.concurrency,
        autorun: false,
      },
    );
  }

  private createQueue(queueName: QueueName) {
    return new Queue(queueName, {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: {
          age: this.REMOVE_ON_COMPLETE_AGE,
        },
        removeOnFail: {
          age: this.REMOVE_ON_FAIL_AGE,
        },
        attempts: this.NUMBER_OF_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: 3000,
          jitter: 0.5,
        },
      },
    });
  }
}
