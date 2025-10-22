import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { GetImportableItemsQuery, GetImportableItemsResult, WishlistItemRepository } from '../../domain'
import { itemMapper } from '../../infrastructure'

@QueryHandler(GetImportableItemsQuery)
export class GetImportableItemsUseCase implements IInferredQueryHandler<GetImportableItemsQuery> {
  constructor(@Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository) {}

  async execute(query: GetImportableItemsQuery): Promise<GetImportableItemsResult> {
    const items = await this.itemRepository.findImportableItems(query.userId)
    return items.map(item => itemMapper.toDto(item))
  }
}
