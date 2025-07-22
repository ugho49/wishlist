import type { ICurrentUser, MiniUserDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetUsersByCriteriaResult = MiniUserDto[]

export class GetUsersByCriteriaQuery extends Query<GetUsersByCriteriaResult> {
  public readonly currentUser: ICurrentUser
  public readonly criteria: string

  constructor(props: { currentUser: ICurrentUser; criteria: string }) {
    super()
    this.currentUser = props.currentUser
    this.criteria = props.criteria
  }
}
