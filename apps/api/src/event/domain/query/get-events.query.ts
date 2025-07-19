import type { EventWithCountsDto, PagedResponse } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetEventsResult = PagedResponse<EventWithCountsDto>

export class GetEventsQuery extends Query<GetEventsResult> {
  public readonly pageNumber: number
  public readonly pageSize: number

  constructor(props: { pageNumber: number; pageSize: number }) {
    super()
    this.pageNumber = props.pageNumber
    this.pageSize = props.pageSize
  }
}
