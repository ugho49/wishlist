import type { UserId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

import { UserSocial } from '../model/user-social.model'

export type GetUserSocialsByUserIdsResult = Map<UserId, UserSocial[]>

export class GetUserSocialsByUserIdsQuery extends Query<GetUserSocialsByUserIdsResult> {
  public readonly userIds: UserId[]

  constructor(props: { userIds: UserId[] }) {
    super()
    this.userIds = props.userIds
  }
}
