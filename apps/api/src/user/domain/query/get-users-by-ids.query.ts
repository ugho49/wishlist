import type { UserId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

import { User } from '../model/user.model'

export class GetUsersByIdsQuery extends Query<User[]> {
  public readonly userIds: UserId[]

  constructor(props: { userIds: UserId[] }) {
    super()
    this.userIds = props.userIds
  }
}
