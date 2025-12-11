import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { FrontendRoutesService, MailService, MailTemplate } from '@wishlist/api/core'

import { UserAddedAsCoOwnerToWishlistEvent } from '../../domain'

@EventsHandler(UserAddedAsCoOwnerToWishlistEvent)
export class UserAddedAsCoOwnerToWishlistUseCase implements IEventHandler<UserAddedAsCoOwnerToWishlistEvent> {
  private readonly logger = new Logger(UserAddedAsCoOwnerToWishlistUseCase.name)

  constructor(
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async handle(params: UserAddedAsCoOwnerToWishlistEvent) {
    this.logger.log('User added as co-owner to wishlist event received', { wishlistId: params.wishlist.id })
    if (!params.wishlist.coOwner) {
      this.logger.error('Co-owner is not set')
      return
    }

    try {
      this.logger.log('Sending mail to co-owner...', { wishlistId: params.wishlist.id })
      await this.mailService.sendMail({
        to: params.wishlist.coOwner.email,
        subject: "[Wishlist] Vous avez été ajouté comme co-gestionnaire d'une liste",
        template: MailTemplate.ADDED_TO_WISHLIST_AS_CO_OWNER,
        context: {
          wishlistTitle: params.wishlist.title,
          wishlistUrl: this.frontendRoutes.routes.wishlist.byId(params.wishlist.id),
          invitedBy: `${params.wishlist.owner.firstName} ${params.wishlist.owner.lastName}`,
        },
      })
    } catch (error) {
      this.logger.error('Fail to send mail to co-owner', error)
    }
  }
}
