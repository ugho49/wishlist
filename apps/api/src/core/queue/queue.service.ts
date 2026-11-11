import { Injectable, type OnStart, type OnStop } from '@znight/core';
import { getLogger } from '@znight/observability';
import { Job, type JobsOptions, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

import { QueueConfig } from './queue.config';
import { QueueProcessorBase } from './queue.type';
import { QueueName, type QueueNamePayloadMap } from './queues.definitions';

const DEFAULT_REMOVE_ON_COMPLETE_AGE = 60 * 60 * 24 * 30; // 30 days
const DEFAULT_REMOVE_ON_FAIL_AGE = 60 * 60 * 24 * 90; // 90 days
const DEFAULT_NUMBER_OF_ATTEMPTS = 5;

@Injectable()
export class QueueService implements OnStart, OnStop {
  private readonly REMOVE_ON_COMPLETE_AGE = DEFAULT_REMOVE_ON_COMPLETE_AGE;
  private readonly REMOVE_ON_FAIL_AGE = DEFAULT_REMOVE_ON_FAIL_AGE;
  private readonly NUMBER_OF_ATTEMPTS = DEFAULT_NUMBER_OF_ATTEMPTS;

  private readonly logger = getLogger(QueueService.name);
  private readonly workers: Worker[] = [];
  private readonly queues: Map<QueueName, Queue> = new Map();
  private readonly connection: Redis;

  constructor(
    private readonly processors: QueueProcessorBase[],
    private readonly config: QueueConfig,
  ) {
    this.connection = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password || undefined,
      db: this.config.db,
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

  async onStart() {
    for (const queueName of Object.values(QueueName)) {
      const matchingProcessors = this.processors.filter(candidate => candidate.queueName === queueName);

      if (matchingProcessors.length === 0) {
        throw new Error(`No queue processor found for queue ${queueName}`);
      }

      if (matchingProcessors.length > 1) {
        throw new Error(`Multiple queue processors found for queue ${queueName}`);
      }

      const processor = matchingProcessors[0];
      if (!processor) {
        throw new Error(`No queue processor found for queue ${queueName}`);
      }

      const processorName = processor.constructor.name;

      const worker = this.createWorker(queueName, processorName, processor);
      this.workers.push(worker);

      const queue = this.createQueue(queueName);
      this.queues.set(queueName, queue);

      if (processor.options.repeat) {
        if (!this.config.scheduledJobsEnabled) {
          this.logger.info(`Scheduled jobs are not enabled, skipping repeatable job for queue ${queueName}`);
          continue;
        }

        await queue.upsertJobScheduler(queueName, processor.options.repeat, {
          name: queueName,
          data: {},
        });
        this.logger.info(`Registered repeatable job for queue ${queueName}`);
      }
    }

    this.startAllWorkers();
  }

  async onStop() {
    await this.stopAllWorkers();
    await Promise.all([...this.queues.values()].map(queue => queue.close()));
    this.connection.disconnect();
  }

  private startAllWorkers() {
    this.logger.info('Starting all workers');
    for (const worker of this.workers) {
      void worker.run();
    }
    this.logger.info('All workers started');
  }

  private async stopAllWorkers() {
    this.logger.info('Stopping all workers');
    await Promise.all(this.workers.map(worker => worker.close()));
    this.logger.info('All workers are stopped');
  }

  private createWorker(queueName: QueueName, processorName: string, processor: QueueProcessorBase) {
    return new Worker(
      queueName,
      async (job: Job<QueueNamePayloadMap[QueueName]>) => {
        const messageId = Bun.randomUUIDv7();
        const resourceName = `${processorName}.process`;
        const logger = this.logger.child({
          messageId,
          job: { id: job.id, name: job.name, handler: resourceName, queueName },
        });

        logger.info(`Message ${messageId} received, forwarding to handlers`, { payload: job.data });

        try {
          await processor.process(job);
        } catch (error) {
          logger.error(`Message ${messageId} rejected due to handler error.`, { error });
          throw error;
        }
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
