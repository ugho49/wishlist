import { Config, Env, Secret } from '@znight/config';

/** Valkey (Redis) connection of the BullMQ queues. */
@Config('valkey')
export class QueueConfig {
  /** VALKEY_HOST */
  host!: string;
  /** VALKEY_PORT */
  port!: number;
  /** VALKEY_PASSWORD */
  @Secret() password = '';
  /** VALKEY_DB */
  db!: number;
  @Env('SCHEDULED_JOBS_ENABLED') scheduledJobsEnabled = true;
}
