import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
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

import {
  CreateItemCommand,
  DeleteItemCommand,
  GetImportableItemsQuery,
  ImportItemsCommand,
  ScanItemUrlQuery,
  ToggleItemCommand,
  UpdateItemCommand,
} from '../domain'

@ApiTags('Item')
@Controller('/item')
export class ItemController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  // Get importable items from old wishlists
  @Get('/importable')
  getImportableItems(@CurrentUser('id') userId: UserId, @Query() dto: GetImportableItemsInputDto): Promise<ItemDto[]> {
    return this.queryBus.execute(new GetImportableItemsQuery({ userId, wishlistId: dto.wishlist_id }))
  }

  @Post('/import')
  importItems(@CurrentUser() currentUser: ICurrentUser, @Body() dto: ImportItemsInputDto): Promise<ItemDto[]> {
    return this.commandBus.execute(
      new ImportItemsCommand({ currentUser, wishlistId: dto.wishlist_id, sourceItemIds: dto.source_item_ids }),
    )
  }

  // Scan an item url to get the picture url
  @Post('/scan-url')
  scanItemUrl(@Body() dto: ScanItemInputDto): Promise<ScanItemOutputDto> {
    return this.queryBus.execute(new ScanItemUrlQuery({ url: dto.url }))
  }

  @Post()
  createItem(@CurrentUser() currentUser: ICurrentUser, @Body() dto: AddItemForListInputDto): Promise<ItemDto> {
    return this.commandBus.execute(
      new CreateItemCommand({
        currentUser,
        wishlistId: dto.wishlist_id,
        newItem: {
          name: dto.name,
          description: dto.description,
          score: dto.score,
          url: dto.url,
          pictureUrl: dto.picture_url,
        },
      }),
    )
  }

  @Put('/:id')
  async updateItem(
    @Param('id') itemId: ItemId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateItemInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateItemCommand({
        itemId,
        currentUser,
        updateItem: {
          name: dto.name,
          description: dto.description,
          score: dto.score,
          url: dto.url,
          pictureUrl: dto.picture_url,
        },
      }),
    )
  }

  @Delete('/:id')
  async deleteItem(@Param('id') itemId: ItemId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.commandBus.execute(new DeleteItemCommand({ itemId, currentUser }))
  }

  @Post('/:id/toggle')
  toggleItem(@Param('id') itemId: ItemId, @CurrentUser() currentUser: ICurrentUser): Promise<ToggleItemOutputDto> {
    return this.commandBus.execute(new ToggleItemCommand({ itemId, currentUser }))
  }
}
