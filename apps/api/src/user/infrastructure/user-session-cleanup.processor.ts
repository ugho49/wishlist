import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { QueueProcessorBase } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { CleanupRevokedUserSessionsUseCase } from '../application/command/cleanup-revoked-user-sessions.use-case';

@Injectable()
export class UserSessionCleanupProcessor extends QueueProcessorBase {
  readonly queueName = QueueName.USER_SESSION_CLEANUP;

  private readonly logger = getLogger(UserSessionCleanupProcessor.name);

  constructor(private readonly cleanupRevokedUserSessionsUseCase: CleanupRevokedUserSessionsUseCase) {
    super({ concurrency: 1, repeat: { pattern: '0 4 * * *' } });
  }

  async process(): Promise<void> {
    this.logger.info('Processing revoked user session cleanup job ...');
    await this.cleanupRevokedUserSessionsUseCase.execute();
  }
}
