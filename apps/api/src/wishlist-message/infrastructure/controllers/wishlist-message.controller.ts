import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  CreateWishlistMessageInputDto,
  CursorPaginatedWishlistMessagesDto,
  GetWishlistMessagesQueryDto,
  ICurrentUser,
  MarkWishlistMessagesAsReadInputDto,
  WishlistMessageDto,
  WishlistMessageId,
} from '@wishlist/common'

import { CurrentUser } from '../../../auth'
import { CreateWishlistMessageUseCase } from '../../application/command/create-wishlist-message.use-case'
import { DeleteWishlistMessageUseCase } from '../../application/command/delete-wishlist-message.use-case'
import { MarkWishlistMessagesAsReadUseCase } from '../../application/command/mark-wishlist-messages-as-read.use-case'
import { GetWishlistMessagesUseCase } from '../../application/query/get-wishlist-messages.use-case'

@ApiTags('Wishlist Message')
@Controller('/wishlist-message')
export class WishlistMessageController {
  constructor(
    private readonly createWishlistMessageUseCase: CreateWishlistMessageUseCase,
    private readonly deleteWishlistMessageUseCase: DeleteWishlistMessageUseCase,
    private readonly getWishlistMessagesUseCase: GetWishlistMessagesUseCase,
    private readonly markWishlistMessagesAsReadUseCase: MarkWishlistMessagesAsReadUseCase,
  ) {}

  @Get()
  getMessages(
    @CurrentUser() currentUser: ICurrentUser,
    @Query() query: GetWishlistMessagesQueryDto,
  ): Promise<CursorPaginatedWishlistMessagesDto> {
    return this.getWishlistMessagesUseCase.execute({
      currentUser,
      wishlistId: query.wishlistId,
      cursor: query.cursor,
      limit: query.limit,
    })
  }

  @Post()
  createMessage(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateWishlistMessageInputDto,
  ): Promise<WishlistMessageDto> {
    return this.createWishlistMessageUseCase.execute({
      currentUser,
      wishlistId: dto.wishlist_id,
      content: dto.content,
    })
  }

  @Put('/read')
  async markAsRead(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: MarkWishlistMessagesAsReadInputDto,
  ): Promise<void> {
    await this.markWishlistMessagesAsReadUseCase.execute({
      currentUser,
      wishlistId: dto.wishlist_id,
    })
  }

  @Delete('/:id')
  async deleteMessage(
    @Param('id') messageId: WishlistMessageId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.deleteWishlistMessageUseCase.execute({ currentUser, messageId })
  }
}
