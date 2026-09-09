import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetUnreadNotificationCountInput = {
  currentUser: ICurrentUser;
};

export type GetUnreadNotificationCountOutput = {
  count: number;
};

@Injectable()
export class GetUnreadNotificationCountUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async execute(input: GetUnreadNotificationCountInput): Promise<GetUnreadNotificationCountOutput> {
    const count = await this.userNotificationRepository.countUnread(input.currentUser.id);
    return { count };
  }
}
