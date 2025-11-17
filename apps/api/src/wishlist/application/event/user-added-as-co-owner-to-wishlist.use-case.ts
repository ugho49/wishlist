import { Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { MailService } from '@wishlist/api/core'

import { UserAddedAsCoOwnerToWishlistEvent } from '../../domain'

@EventsHandler(UserAddedAsCoOwnerToWishlistEvent)
export class UserAddedAsCoOwnerToWishlistUseCase implements IEventHandler<UserAddedAsCoOwnerToWishlistEvent> {
  private readonly logger = new Logger(UserAddedAsCoOwnerToWishlistUseCase.name)

  constructor(private readonly mailService: MailService) {}

  async handle(params: UserAddedAsCoOwnerToWishlistEvent) {
    if (!params.wishlist.coOwner) {
      this.logger.error('Co-owner is not set')
      return
    }

    try {
      await this.mailService.sendMail({
        to: params.wishlist.coOwner.email,
        subject: "[Wishlist] Vous avez été ajouté comme co-gestionnaire d'une liste",
        template: 'added-to-wishlist-as-co-owner',
        context: {
          wishlistTitle: params.wishlist.title,
          wishlistUrl: `https://wishlistapp.fr/wishlists/${params.wishlist.id}`,
          invitedBy: `${params.wishlist.owner.firstName} ${params.wishlist.owner.lastName}`,
        },
      })
    } catch (error) {
      this.logger.error('Fail to send mail to co-owner', error)
    }
  }
}
