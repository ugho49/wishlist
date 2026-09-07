import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type MarkAllNotificationsReadInput = {
  currentUser: ICurrentUser;
};

@Injectable()
export class MarkAllNotificationsReadUseCase {
  private readonly logger = new Logger(MarkAllNotificationsReadUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
  ) {}

  async execute(input: MarkAllNotificationsReadInput): Promise<void> {
    this.logger.log('Marking all notifications as read', { userId: input.currentUser.id });
    await this.userNotificationRepository.markAllRead(input.currentUser.id);
  }
}
