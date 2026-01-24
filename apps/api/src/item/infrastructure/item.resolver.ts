import type { ICurrentUser } from '@wishlist/common'

import { Logger } from '@nestjs/common'
import { Args, Context, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser, Public } from '@wishlist/api/auth'
import { GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { ItemId, UserId } from '@wishlist/common'

import {
  CreateItemInput,
  CreateItemResult,
  DeleteItemResult,
  Item,
  ScanItemUrlInput,
  ScanItemUrlResult,
  ToggleItemResult,
  UpdateItemInput,
  UpdateItemResult,
  User,
} from '../../gql/generated-types'
import { CreateItemUseCase } from '../application/command/create-item.use-case'
import { DeleteItemUseCase } from '../application/command/delete-item.use-case'
import { ToggleItemUseCase } from '../application/command/toggle-item.use-case'
import { UpdateItemUseCase } from '../application/command/update-item.use-case'
import { ScanItemUrlUseCase } from '../application/query/scan-item-url.use-case'
import { itemMapper } from './item.mapper'
import { CreateItemInputSchema, ItemIdSchema, ScanItemUrlInputSchema, UpdateItemInputSchema } from './item.schema'

@Resolver('Item')
export class ItemResolver {
  private readonly logger = new Logger(ItemResolver.name)

  constructor(
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly deleteItemUseCase: DeleteItemUseCase,
    private readonly toggleItemUseCase: ToggleItemUseCase,
    private readonly scanItemUrlUseCase: ScanItemUrlUseCase,
  ) {}

  @ResolveField()
  async takerUser(@Parent() item: Item, @Context() ctx: GraphQLContext): Promise<User | undefined> {
    if (!item.takenById) return undefined
    const takerUser = await ctx.loaders.user.load(item.takenById as UserId)
    if (!takerUser) {
      this.logger.warn(`Taker user not found for item ${item.id}`, { itemId: item.id, takenById: item.takenById })
      return undefined
    }
    return takerUser
  }

  @Mutation()
  async createItem(
    @Args('input', new ZodPipe(CreateItemInputSchema)) input: CreateItemInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<CreateItemResult> {
    const result = await this.createItemUseCase.execute({
      currentUser,
      wishlistId: input.wishlistId,
      newItem: {
        name: input.name,
        description: input.description ?? undefined,
        score: input.score ?? undefined,
        url: input.url ?? undefined,
        pictureUrl: input.pictureUrl ?? undefined,
      },
    })

    return itemMapper.dtoToGqlItem(result)
  }

  @Mutation()
  async updateItem(
    @Args('itemId', new ZodPipe(ItemIdSchema)) itemId: ItemId,
    @Args('input', new ZodPipe(UpdateItemInputSchema)) input: UpdateItemInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateItemResult> {
    await this.updateItemUseCase.execute({
      itemId,
      currentUser,
      updateItem: {
        name: input.name,
        description: input.description ?? undefined,
        score: input.score ?? undefined,
        url: input.url ?? undefined,
        pictureUrl: input.pictureUrl ?? undefined,
      },
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async deleteItem(
    @Args('itemId', new ZodPipe(ItemIdSchema)) itemId: ItemId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteItemResult> {
    await this.deleteItemUseCase.execute({ itemId, currentUser })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async toggleItem(
    @Args('itemId', new ZodPipe(ItemIdSchema)) itemId: ItemId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<ToggleItemResult> {
    const result = await this.toggleItemUseCase.execute({ itemId, currentUser })

    return {
      __typename: 'ToggleItemOutput',
      takenById: result.taken_by?.id,
      takenAt: result.taken_at,
    }
  }

  @Public()
  @Mutation()
  async scanItemUrl(
    @Args('input', new ZodPipe(ScanItemUrlInputSchema)) input: ScanItemUrlInput,
  ): Promise<ScanItemUrlResult> {
    const result = await this.scanItemUrlUseCase.execute({ url: input.url })

    return {
      __typename: 'ScanItemUrlOutput',
      pictureUrl: result.picture_url,
    }
  }
}
