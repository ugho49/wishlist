import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Logger } from '@nestjs/common';
import { DateTime } from 'luxon';

import { createMock } from '../../../../test-utils/mocks';
import { CleanupRevokedUserSessionsUseCase } from './cleanup-revoked-user-sessions.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CleanupRevokedUserSessionsUseCase', () => {
  const sessionRepository = createMock<UserSessionRepository>();

  let useCase: CleanupRevokedUserSessionsUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    sessionRepository.deleteRevokedOlderThan.mockResolvedValue(0);
    useCase = new CleanupRevokedUserSessionsUseCase(sessionRepository);
  });

  it('should delete sessions revoked more than 6 months ago', async () => {
    sessionRepository.deleteRevokedOlderThan.mockResolvedValueOnce(3);

    await useCase.execute();

    expect(sessionRepository.deleteRevokedOlderThan).toHaveBeenCalledTimes(1);
    const cutoff = sessionRepository.deleteRevokedOlderThan.mock.calls[0]?.[0];
    expect(cutoff).toBeInstanceOf(Date);
    const expected = DateTime.now().minus({ months: 6 }).toMillis();
    expect(Math.abs(cutoff!.getTime() - expected)).toBeLessThan(2000);
  });
});
