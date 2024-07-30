import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'

import { WishlistRepository } from '../wishlist/wishlist.repository'
import { NewItemsForWishlist } from './item.interface'
import { ItemMailer } from './item.mailer'
import { ItemRepository } from './item.repository'

@Injectable()
export class ItemScheduler {
  private readonly logger = new Logger(ItemScheduler.name)

  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly itemMailer: ItemMailer,
  ) {}

  // Fire at 10:15 AM every day
  @Cron('0 15 10 * * *')
  async sendNewItemNotification() {
    try {
      this.logger.log('Fetch new items to send daily notification')

      const newItemsForWishlists = await this.itemRepository.findAllNewItems()

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

      await this.itemMailer.sendNotifyEmail({
        emails: allEmailToNotify,
        nbNewItems: dto.nbNewItems,
        wishlist: { id: dto.wishlistId, title: dto.wishlistTitle },
        ownerName: dto.ownerName,
      })
    } catch (e) {
      this.logger.error(`Fail to notify new items for wishlist ${dto.wishlistId}`, e)
    }
  }
}
