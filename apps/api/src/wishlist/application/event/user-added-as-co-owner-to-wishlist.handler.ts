import type { UserRepository } from '../../../user/domain/repository/user.repository';

import { OnEvent } from '@znight/events';
import { getLogger } from '@znight/observability';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { UserAddedAsCoOwnerToWishlistEvent } from '../../domain/event/user-added-as-co-owner-to-wishlist.event';

export class UserAddedAsCoOwnerToWishlistHandler {
  private readonly logger = getLogger(UserAddedAsCoOwnerToWishlistHandler.name);

  constructor(
    private readonly mailService: MailService,
    private readonly userRepository: UserRepository,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  @OnEvent({ detached: true })
  async handle(params: UserAddedAsCoOwnerToWishlistEvent) {
    const { wishlist, coOwner } = params;
    this.logger.info('User added as co-owner to wishlist event received', { wishlistId: wishlist.id });

    const owner = await this.userRepository.findByIdOrFail(wishlist.ownerId);

    try {
      this.logger.info('Sending mail to co-owner...', { wishlistId: wishlist.id });
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
      this.logger.error('Fail to send mail to co-owner', { error: error });
    }
  }
}
