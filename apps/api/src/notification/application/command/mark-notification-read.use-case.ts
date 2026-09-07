import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type ICurrentUser, type UserNotificationId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type MarkNotificationReadInput = {
  currentUser: ICurrentUser;
  notificationId: UserNotificationId;
};

@Injectable()
export class MarkNotificationReadUseCase {
  private readonly logger = new Logger(MarkNotificationReadUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async execute(input: MarkNotificationReadInput): Promise<void> {
    const notification = await this.userNotificationRepository.findByIdForUser({
      id: input.notificationId,
      userId: input.currentUser.id,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = notification.markRead();
    if (updated === notification) {
      return;
    }

    this.logger.log('Marking notification as read', { notificationId: notification.id, userId: input.currentUser.id });
    await this.userNotificationRepository.save(updated);
  }
}
