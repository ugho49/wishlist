import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  AddItemForListInputDto,
  AddItemInputDto,
  ItemDto,
  ScanItemInputDto,
  ScanItemOutputDto,
  ToggleItemOutputDto,
} from '@wishlist/common-types'

import { CurrentUser } from '../auth'
import { ItemService } from './item.service'
import { ScrapperService } from './scrapper.service'

@ApiTags('Item')
@Controller('/item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly scrapperService: ScrapperService,
  ) {}

  @Post('/scan-url')
  async scanUrl(@Body() dto: ScanItemInputDto): Promise<ScanItemOutputDto> {
    return this.scrapperService.scanUrl(dto.url).then(picture_url => ({
      picture_url,
    }))
  }

  @Post()
  createItem(@CurrentUser('id') currentUserId: string, @Body() dto: AddItemForListInputDto): Promise<ItemDto> {
    return this.itemService.create({ dto, currentUserId })
  }

  @Put('/:id')
  updateItem(
    @Param('id') itemId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() dto: AddItemInputDto,
  ): Promise<void> {
    return this.itemService.update({ itemId, dto, currentUserId })
  }

  @Delete('/:id')
  deleteItem(@Param('id') itemId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    return this.itemService.deleteItem({ itemId, currentUserId })
  }

  @Post('/:id/toggle')
  toggleItem(@Param('id') itemId: string, @CurrentUser('id') currentUserId: string): Promise<ToggleItemOutputDto> {
    return this.itemService.toggleItem({ itemId, currentUserId })
  }
}
