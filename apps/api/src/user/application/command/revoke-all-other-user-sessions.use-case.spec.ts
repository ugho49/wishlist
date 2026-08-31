import type { UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

import { Logger } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserRefreshTokenBuilder } from '../../../../test-utils/builders/user-refresh-token.builder';
import { createMock } from '../../../../test-utils/mocks';
import { RevokeAllOtherUserSessionsUseCase } from './revoke-all-other-user-sessions.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RevokeAllOtherUserSessionsUseCase', () => {
  const refreshTokenRepository = createMock<UserRefreshTokenRepository>();

  let useCase: RevokeAllOtherUserSessionsUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new RevokeAllOtherUserSessionsUseCase(refreshTokenRepository);
  });

  it('should revoke all sessions except the current one', async () => {
    const user = new UserBuilder().build();
    const session = new UserRefreshTokenBuilder().build(user);

    await useCase.execute({ currentUser: toCurrentUser(user, session.id) });

    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(user.id, { exceptId: session.id });
  });

  it('should revoke all sessions when the access token has no sid', async () => {
    const user = new UserBuilder().build();

    await useCase.execute({ currentUser: toCurrentUser(user) });

    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(user.id, { exceptId: undefined });
  });
});
