import { Query } from '@nestjs-architects/typed-cqrs'
import type { ICurrentUser } from '@wishlist/common'

export class GetPendingEmailChangeQuery extends Query<GetPendingEmailChangeResult> {
  public readonly currentUser: ICurrentUser

  constructor(props: { currentUser: ICurrentUser }) {
    super()
    this.currentUser = props.currentUser
  }
}

export type GetPendingEmailChangeResult =
  | {
      newEmail: string
      expiredAt: string
    }
  | undefined
