import { Injectable } from '@nestjs/common'
import { MailService } from '@wishlist/api/core'
import { WishlistId } from '@wishlist/common'

@Injectable()
export class ItemMailer {
  constructor(private readonly mailService: MailService) {}

  async sendNotifyEmail(param: {
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
