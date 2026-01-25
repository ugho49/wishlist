import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import {
  AddItemForListInputDto,
  GetImportableItemsInputDto,
  ICurrentUser,
  ImportItemsInputDto,
  ItemDto,
  ItemId,
  ScanItemInputDto,
  ScanItemOutputDto,
  ToggleItemOutputDto,
  UpdateItemInputDto,
  UserId,
} from '@wishlist/common'

import { CreateItemUseCase } from '../application/command/create-item.use-case'
import { DeleteItemUseCase } from '../application/command/delete-item.use-case'
import { ImportItemsUseCase } from '../application/command/import-items.use-case'
import { ToggleItemUseCase } from '../application/command/toggle-item.use-case'
import { UpdateItemUseCase } from '../application/command/update-item.use-case'
import { GetImportableItemsUseCase } from '../application/query/get-importable-items.use-case'
import { ScanItemUrlUseCase } from '../application/query/scan-item-url.use-case'
import { itemMapper } from './item.mapper'

@ApiTags('Item')
@Controller('/item')
export class ItemController {
  constructor(
    private readonly getImportableItemsUseCase: GetImportableItemsUseCase,
    private readonly importItemsUseCase: ImportItemsUseCase,
    private readonly scanItemUrlUseCase: ScanItemUrlUseCase,
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly deleteItemUseCase: DeleteItemUseCase,
    private readonly toggleItemUseCase: ToggleItemUseCase,
  ) {}

  // Get importable items from old wishlists
  @Get('/importable')
  async getImportableItems(
    @CurrentUser('id') userId: UserId,
    @Query() dto: GetImportableItemsInputDto,
  ): Promise<ItemDto[]> {
    const items = await this.getImportableItemsUseCase.execute({ userId, wishlistId: dto.wishlist_id })
    return items.map(item => itemMapper.toDto({ item, displayUserAndSuggested: false }))
  }

  @Post('/import')
  async importItems(@CurrentUser() currentUser: ICurrentUser, @Body() dto: ImportItemsInputDto): Promise<ItemDto[]> {
    const items = await this.importItemsUseCase.execute({
      currentUser,
      wishlistId: dto.wishlist_id,
      sourceItemIds: dto.source_item_ids,
    })

    return items.map(item => itemMapper.toDto({ item, displayUserAndSuggested: false }))
  }

  // Scan an item url to get the picture url
  @Post('/scan-url')
  scanItemUrl(@Body() dto: ScanItemInputDto): Promise<ScanItemOutputDto> {
    return this.scanItemUrlUseCase.execute({ url: dto.url })
  }

  @Post()
  async createItem(@CurrentUser() currentUser: ICurrentUser, @Body() dto: AddItemForListInputDto): Promise<ItemDto> {
    const item = await this.createItemUseCase.execute({
      currentUser,
      wishlistId: dto.wishlist_id,
      newItem: {
        name: dto.name,
        description: dto.description,
        score: dto.score,
        url: dto.url,
        pictureUrl: dto.picture_url,
      },
    })

    return itemMapper.toDto({ item, displayUserAndSuggested: true })
  }

  @Put('/:id')
  async updateItem(
    @Param('id') itemId: ItemId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateItemInputDto,
  ): Promise<void> {
    await this.updateItemUseCase.execute({
      itemId,
      currentUser,
      updateItem: {
        name: dto.name,
        description: dto.description,
        score: dto.score,
        url: dto.url,
        pictureUrl: dto.picture_url,
      },
    })
  }

  @Delete('/:id')
  async deleteItem(@Param('id') itemId: ItemId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.deleteItemUseCase.execute({ itemId, currentUser })
  }

  @Post('/:id/toggle')
  toggleItem(@Param('id') itemId: ItemId, @CurrentUser() currentUser: ICurrentUser): Promise<ToggleItemOutputDto> {
    return this.toggleItemUseCase.execute({ itemId, currentUser })
  }
}
