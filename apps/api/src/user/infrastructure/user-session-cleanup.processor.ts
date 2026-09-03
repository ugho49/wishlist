import { Injectable, Logger } from '@nestjs/common';

import { QueueProcessor } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { CleanupRevokedUserSessionsUseCase } from '../application/command/cleanup-revoked-user-sessions.use-case';

@Injectable()
export class UserSessionCleanupProcessor extends QueueProcessor(QueueName.USER_SESSION_CLEANUP) {
  private readonly logger = new Logger(UserSessionCleanupProcessor.name);

  constructor(private readonly cleanupRevokedUserSessionsUseCase: CleanupRevokedUserSessionsUseCase) {
    super({ concurrency: 1, repeat: { pattern: '0 4 * * *' } });
  }

  async process(): Promise<void> {
    this.logger.log('Processing revoked user session cleanup job ...');
    await this.cleanupRevokedUserSessionsUseCase.execute();
  }
}
