import type { MiniUserDto, UserId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetClosestFriendsResult = MiniUserDto[]

export class GetClosestFriendsQuery extends Query<GetClosestFriendsResult> {
  public readonly userId: UserId
  public readonly limit: number

  constructor(props: { userId: UserId; limit: number }) {
    super()
    this.userId = props.userId
    this.limit = props.limit
  }
}
