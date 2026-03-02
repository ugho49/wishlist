import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  CreateWishlistMessageInputDto,
  ICurrentUser,
  WishlistId,
  WishlistMessageDto,
  WishlistMessageId,
} from '@wishlist/common'

import { CurrentUser } from '../../../auth'
import { CreateWishlistMessageUseCase } from '../../application/command/create-wishlist-message.use-case'
import { DeleteWishlistMessageUseCase } from '../../application/command/delete-wishlist-message.use-case'
import { GetWishlistMessagesUseCase } from '../../application/query/get-wishlist-messages.use-case'

@ApiTags('Wishlist Message')
@Controller('/wishlist-message')
export class WishlistMessageController {
  constructor(
    private readonly createWishlistMessageUseCase: CreateWishlistMessageUseCase,
    private readonly deleteWishlistMessageUseCase: DeleteWishlistMessageUseCase,
    private readonly getWishlistMessagesUseCase: GetWishlistMessagesUseCase,
  ) {}

  @Get()
  getMessages(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('wishlistId') wishlistId: WishlistId,
  ): Promise<WishlistMessageDto[]> {
    return this.getWishlistMessagesUseCase.execute({ currentUser, wishlistId })
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

  @Delete('/:id')
  async deleteMessage(
    @Param('id') messageId: WishlistMessageId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.deleteWishlistMessageUseCase.execute({ currentUser, messageId })
  }
}
