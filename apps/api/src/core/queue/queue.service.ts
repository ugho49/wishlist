import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { Queue } from 'bullmq'

import queueConfig from './queue.config'
import { BullMQJobOptions, QUEUES, QueueName } from './queues.type'

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name)
  private readonly queuesMap: Map<QueueName, Queue> = new Map()

  constructor(
    @Inject(QUEUES) queues: Queue[],
    @Inject(queueConfig.KEY) private readonly config: ConfigType<typeof queueConfig>,
  ) {
    for (const queue of queues) {
      this.queuesMap.set(queue.name as QueueName, queue)
    }
  }

  /**
   * Schedules a job with a repeat pattern in BullMQ.
   * @param queueName the queue name
   * @param jobName the name of the job
   * @param payload the payload of the job
   * @param repeatPattern the repeat pattern for the job
   * @param options the options for the job
   */
  async scheduleBullMQJob(params: {
    queueName: QueueName
    jobName: string
    data: unknown
    repeatPattern: string
    options?: BullMQJobOptions
  }): Promise<void> {
    const { queueName, jobName, data, repeatPattern, options } = params

    if (!this.config.scheduledJobsEnabled) {
      this.logger.log(
        `❌ Scheduled jobs are not enabled, skipping registration of the job "${jobName}" on queue "${queueName}"`,
        { jobName, queueName, repeatPattern, options },
      )
      return
    }

    this.logger.log(`📅 Scheduling job "${jobName}" on queue "${queueName}" ...`, {
      jobName,
      queueName,
      repeatPattern,
      options,
    })

    const job = await this.queuesMap
      .get(queueName)
      ?.upsertJobScheduler(jobName, { pattern: repeatPattern }, { data, name: jobName, opts: options })

    this.logger.log(`✅ Job "${jobName}" successfully created on queue "${queueName}"`, {
      jobId: job?.id,
      jobName,
      queueName,
      repeatPattern,
      options,
    })
  }
}
