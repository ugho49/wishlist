import { Inject, Injectable, Logger } from '@nestjs/common'
import { FrontendRoutesService, MailService, MailTemplate } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { WishlistId } from '@wishlist/common'
import { DateTime } from 'luxon'

import { NewItemsForWishlist, WishlistItemRepository } from '../../domain'

@Injectable()
export class NotifyNewItemsUseCase {
  private readonly logger = new Logger(NotifyNewItemsUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async execute(): Promise<void> {
    try {
      const oneDayAgo = DateTime.now().minus({ days: 1 }).toJSDate()

      this.logger.log(`Fetching new items to send daily notification since "${oneDayAgo.toISOString()}" ...`)

      const newItemsForWishlists = await this.itemRepository.findAllNewItems(oneDayAgo)

      if (newItemsForWishlists.length === 0) {
        this.logger.log('No new items to send daily notification')
        return
      }

      this.logger.log(`Found ${newItemsForWishlists.length} new items to send daily notification`)

      for (const newItemsForWishlist of newItemsForWishlists) {
        await this.notify(newItemsForWishlist)
      }
    } catch (e) {
      this.logger.error('Fail to send new item notification', e)
    }
  }

  private async notify(dto: NewItemsForWishlist) {
    try {
      this.logger.log(`Notifying wishlist "${dto.wishlistId}" ...`, {
        wishlistId: dto.wishlistId,
        nbNewItems: dto.nbNewItems,
      })

      const allEmailToNotify = await this.wishlistRepository.findEmailsToNotify({
        wishlistId: dto.wishlistId,
        ownerId: dto.ownerId,
      })

      if (allEmailToNotify.length === 0) {
        this.logger.log(`No emails to notify for wishlist ${dto.wishlistId}`)
        return
      }

      this.logger.log(
        `Notifying ${allEmailToNotify.length} peoples for new items in wishlist "${dto.wishlistId}" ...`,
        { wishlistId: dto.wishlistId },
      )

      await this.sendNotifyEmail({
        emails: allEmailToNotify,
        nbNewItems: dto.nbNewItems,
        wishlist: { id: dto.wishlistId, title: dto.wishlistTitle },
        ownerName: dto.ownerName,
      })

      this.logger.log(`✅ New items notification sent successfully for wishlist "${dto.wishlistId}"`)
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
      template: MailTemplate.NEW_ITEMS_REMINDER,
      context: {
        wishlistTitle: param.wishlist.title,
        wishlistUrl: this.frontendRoutes.routes.wishlist.byId(param.wishlist.id),
        nbItems: param.nbNewItems,
        userName: param.ownerName,
      },
    })
  }
}
