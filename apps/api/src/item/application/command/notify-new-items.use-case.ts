import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { MailService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { WishlistId } from '@wishlist/common'
import { DateTime } from 'luxon'

import { NewItemsForWishlist, NotifyNewItemsCommand, WishlistItemRepository } from '../../domain'

@CommandHandler(NotifyNewItemsCommand)
export class NotifyNewItemsUseCase implements IInferredCommandHandler<NotifyNewItemsCommand> {
  private readonly logger = new Logger(NotifyNewItemsUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    private readonly mailService: MailService,
  ) {}

  async execute() {
    try {
      const oneDayAgo = DateTime.now().minus({ days: 1 }).toJSDate()

      this.logger.log('Fetch new items to send daily notification since ' + oneDayAgo.toISOString())

      const newItemsForWishlists = await this.itemRepository.findAllNewItems(oneDayAgo)

      for (const newItemsForWishlist of newItemsForWishlists) {
        await this.notify(newItemsForWishlist)
      }
    } catch (e) {
      this.logger.error('Fail to send new item notification', e)
    }
  }

  private async notify(dto: NewItemsForWishlist) {
    try {
      const allEmailToNotify = await this.wishlistRepository.findEmailsToNotify({
        wishlistId: dto.wishlistId,
        ownerId: dto.ownerId,
      })

      if (allEmailToNotify.length === 0) {
        return
      }

      this.logger.log(`Notify ${allEmailToNotify.length} peoples for new items in wishlist ${dto.wishlistId}`)

      await this.sendNotifyEmail({
        emails: allEmailToNotify,
        nbNewItems: dto.nbNewItems,
        wishlist: { id: dto.wishlistId, title: dto.wishlistTitle },
        ownerName: dto.ownerName,
      })
    } catch (e) {
      this.logger.error(`Fail to notify new items for wishlist ${dto.wishlistId}`, e)
    }
  }

  private async sendNotifyEmail(param: {
    emails: string[]
    wishlist: { id: WishlistId; title: string }
    ownerName: string
    nbNewItems: number
  }) {
    await this.mailService.sendMail({
      to: param.emails,
      subject: '[Wishlist] Des souhaits ont été ajoutés !!',
      template: 'new-items-reminder',
      context: {
        wishlistTitle: param.wishlist.title,
        wishlistUrl: `https://wishlistapp.fr/wishlists/${param.wishlist.id}`,
        nbItems: param.nbNewItems,
        userName: param.ownerName,
      },
    })
  }
}
