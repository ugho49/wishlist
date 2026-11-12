import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';
import { DateTime } from 'luxon';

const REVOKED_SESSION_RETENTION_MONTHS = 6;

@Injectable()
export class CleanupRevokedUserSessionsUseCase {
  private readonly logger = getLogger(CleanupRevokedUserSessionsUseCase.name);

  constructor(private readonly sessionRepository: UserSessionRepository) {}

  async execute(): Promise<void> {
    const cutoff = DateTime.now().minus({ months: REVOKED_SESSION_RETENTION_MONTHS }).toJSDate();
    this.logger.info(`Deleting sessions revoked before ${cutoff.toISOString()}`);

    const deleted = await this.sessionRepository.deleteRevokedOlderThan(cutoff);

    this.logger.info(`Deleted ${deleted} revoked user session(s)`);
  }
}
