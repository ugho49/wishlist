import { BackoffOptions, KeepJobs } from 'bullmq'

export const QUEUES = Symbol('QUEUES')

export enum QueueName {
  MAILS = 'mails',
  ITEMS_NOTIFICATIONS = 'items-notifications',
}

export interface BullMQJobOptions {
  delay?: number
  priority?: number
  backoff?: BackoffOptions
  removeOnComplete?: boolean | KeepJobs
  removeOnFail?: boolean | KeepJobs
  attempts?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  repeat?: {
    pattern?: string
    key?: string
  }
  deduplication?: {
    id: string
    ttl?: number
    extend?: boolean
    replace?: boolean
  }
}
