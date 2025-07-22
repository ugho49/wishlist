import type { UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type UpdateUserPictureResult = {
  pictureUrl: string
}

export class UpdateUserPictureCommand extends Command<UpdateUserPictureResult> {
  public readonly userId: UserId
  public readonly file: Express.Multer.File

  constructor(props: { userId: UserId; file: Express.Multer.File }) {
    super()
    this.userId = props.userId
    this.file = props.file
  }
}
