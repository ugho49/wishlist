import type { ICurrentUser, UpdateWishlistLogoOutputDto, WishlistId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class UploadWishlistLogoCommand extends Command<UploadWishlistLogoResult> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId
  public readonly file: Express.Multer.File

  constructor(props: { currentUser: ICurrentUser; wishlistId: WishlistId; file: Express.Multer.File }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
    this.file = props.file
  }
}

export type UploadWishlistLogoResult = UpdateWishlistLogoOutputDto
