import type { PagedResponse, UserWithoutSocialsDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetUsersPaginatedResult = PagedResponse<UserWithoutSocialsDto>

export class GetUsersPaginatedQuery extends Query<GetUsersPaginatedResult> {
  public readonly criteria?: string
  public readonly pageNumber: number

  constructor(props: { criteria?: string; pageNumber: number }) {
    super()
    this.criteria = props.criteria
    this.pageNumber = props.pageNumber
  }
}
