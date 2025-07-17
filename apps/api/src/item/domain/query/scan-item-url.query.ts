import type { ScanItemOutputDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type ScanItemUrlResult = ScanItemOutputDto

export class ScanItemUrlQuery extends Query<ScanItemUrlResult> {
  public readonly url: string

  constructor(props: { url: string }) {
    super()
    this.url = props.url
  }
}
