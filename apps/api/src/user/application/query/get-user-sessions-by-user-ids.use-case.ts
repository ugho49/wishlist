import type { UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserRefreshToken } from '../../domain/model/user-refresh-token.model';

export type GetUserSessionsByUserIdsInput = {
  userIds: UserId[];
};

@Injectable()
export class GetUserSessionsByUserIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_REFRESH_TOKEN)
    private readonly refreshTokenRepository: UserRefreshTokenRepository,
  ) {}

  async execute(query: GetUserSessionsByUserIdsInput): Promise<Map<UserId, UserRefreshToken[]>> {
    const sessions = await this.refreshTokenRepository.findActiveByUserIds(query.userIds);

    return sessions.reduce((acc, session) => {
      if (!acc.has(session.userId)) {
        acc.set(session.userId, []);
      }
      acc.get(session.userId)?.push(session);
      return acc;
    }, new Map<UserId, UserRefreshToken[]>());
  }
}
