import type { UserDto, UserId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetUserByIdResult = UserDto

export class GetUserByIdQuery extends Query<GetUserByIdResult> {
  public readonly userId: UserId

  constructor(props: { userId: UserId }) {
    super()
    this.userId = props.userId
  }
}
