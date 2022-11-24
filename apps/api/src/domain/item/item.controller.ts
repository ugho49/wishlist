import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItemService } from './item.service';
import { AddItemForListInputDto, AddItemInputDto, ItemDto } from '@wishlist/common-types';
import { CurrentUser } from '../auth';

@ApiTags('Item')
@Controller('/item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  createItem(@CurrentUser('id') currentUserId: string, @Body() dto: AddItemForListInputDto): Promise<ItemDto> {
    return this.itemService.create({ dto, currentUserId });
  }

  @Put('/:id')
  updateItem(
    @Param('id') itemId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: AddItemInputDto
  ): Promise<void> {
    return this.itemService.update({ itemId, dto, currentUserId });
  }

  @Delete('/:id')
  deleteItem(@Param('id') itemId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.itemService.deleteItem({ itemId, currentUserId });
  }

  @Post('/:id/toggle')
  toggleItem(@Param('id') itemId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.itemService.toggleItem({ itemId, currentUserId });
  }
}
