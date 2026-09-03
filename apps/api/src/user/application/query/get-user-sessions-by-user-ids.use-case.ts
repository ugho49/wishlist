import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserSession } from '../../domain/model/user-session.model';

export type GetUserSessionsByUserIdsInput = {
  userIds: UserId[];
};

@Injectable()
export class GetUserSessionsByUserIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_SESSION)
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async execute(query: GetUserSessionsByUserIdsInput): Promise<Map<UserId, UserSession[]>> {
    const sessions = await this.sessionRepository.findActiveByUserIds(query.userIds);

    return sessions.reduce((acc, session) => {
      if (!acc.has(session.userId)) {
        acc.set(session.userId, []);
      }
      acc.get(session.userId)?.push(session);
      return acc;
    }, new Map<UserId, UserSession[]>());
  }
}
