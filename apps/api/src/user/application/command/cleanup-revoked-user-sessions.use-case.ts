import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

const REVOKED_SESSION_RETENTION_MONTHS = 6;

@Injectable()
export class CleanupRevokedUserSessionsUseCase {
  private readonly logger = new Logger(CleanupRevokedUserSessionsUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_SESSION)
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async execute(): Promise<void> {
    const cutoff = DateTime.now().minus({ months: REVOKED_SESSION_RETENTION_MONTHS }).toJSDate();
    this.logger.log(`Deleting sessions revoked before ${cutoff.toISOString()}`);

    const deleted = await this.sessionRepository.deleteRevokedOlderThan(cutoff);

    this.logger.log(`Deleted ${deleted} revoked user session(s)`);
  }
}
