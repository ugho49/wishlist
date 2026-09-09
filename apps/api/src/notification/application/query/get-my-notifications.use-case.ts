import type { UserNotification } from '../../domain/model/user-notification.model';
import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetMyNotificationsInput = {
  currentUser: ICurrentUser;
  pageNumber: number;
  pageSize: number;
};

export type GetMyNotificationsOutput = {
  notifications: UserNotification[];
  totalCount: number;
  unreadCount: number;
};

@Injectable()
export class GetMyNotificationsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async execute(input: GetMyNotificationsInput): Promise<GetMyNotificationsOutput> {
    const skip = (input.pageNumber - 1) * input.pageSize;
    const [{ notifications, totalCount }, unreadCount] = await Promise.all([
      this.userNotificationRepository.findByUserIdPaginated({
        userId: input.currentUser.id,
        pagination: { take: input.pageSize, skip },
      }),
      this.userNotificationRepository.countUnread(input.currentUser.id),
    ]);

    return { notifications, totalCount, unreadCount };
  }
}
