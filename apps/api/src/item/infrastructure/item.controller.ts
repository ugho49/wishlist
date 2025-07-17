import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import {
  AddItemForListInputDto,
  ICurrentUser,
  ItemDto,
  ItemId,
  ScanItemInputDto,
  ScanItemOutputDto,
  ToggleItemOutputDto,
  UpdateItemInputDto,
} from '@wishlist/common'

import { CreateItemCommand, DeleteItemCommand, ScanItemUrlQuery, ToggleItemCommand, UpdateItemCommand } from '../domain'

@ApiTags('Item')
@Controller('/item')
export class ItemController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  // Scan an item url to get the picture url
  @Post('/scan-url')
  async scanItemUrl(@Body() dto: ScanItemInputDto): Promise<ScanItemOutputDto> {
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
