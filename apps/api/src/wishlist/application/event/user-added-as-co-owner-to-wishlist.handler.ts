import type { UserRepository } from '../../../user/domain/repository/user.repository';

import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserAddedAsCoOwnerToWishlistEvent } from '../../domain/event/user-added-as-co-owner-to-wishlist.event';

@EventsHandler(UserAddedAsCoOwnerToWishlistEvent)
export class UserAddedAsCoOwnerToWishlistHandler implements IEventHandler<UserAddedAsCoOwnerToWishlistEvent> {
  private readonly logger = new Logger(UserAddedAsCoOwnerToWishlistHandler.name);

  constructor(
    private readonly mailService: MailService,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: UserAddedAsCoOwnerToWishlistEvent) {
    const { wishlist, coOwner } = params;
    this.logger.log('User added as co-owner to wishlist event received', { wishlistId: wishlist.id });

    const owner = await this.userRepository.findByIdOrFail(wishlist.ownerId);

    try {
      this.logger.log('Sending mail to co-owner...', { wishlistId: wishlist.id });
      await this.mailService.sendMail({
        to: coOwner.email,
        subject: "Vous avez été ajouté comme co-gestionnaire d'une liste",
        template: MailTemplate.ADDED_TO_WISHLIST_AS_CO_OWNER,
        context: {
          wishlistTitle: params.wishlist.title,
          wishlistUrl: this.frontendRoutes.routes.wishlist.byId(params.wishlist.id),
          invitedBy: `${owner.firstName} ${owner.lastName}`,
        },
      });
    } catch (error) {
      this.logger.error('Fail to send mail to co-owner', error);
    }
  }
}
