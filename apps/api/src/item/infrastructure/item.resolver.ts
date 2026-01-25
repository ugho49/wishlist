import type { ICurrentUser, WishlistId } from '@wishlist/common'

import { Logger } from '@nestjs/common'
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { ItemId, UserId } from '@wishlist/common'

import {
  CreateItemInput,
  CreateItemResult,
  DeleteItemResult,
  GetImportableItemsOutput,
  ImportItemsInput,
  ImportItemsResult,
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
import { ImportItemsUseCase } from '../application/command/import-items.use-case'
import { ToggleItemUseCase } from '../application/command/toggle-item.use-case'
import { UpdateItemUseCase } from '../application/command/update-item.use-case'
import { GetImportableItemsUseCase } from '../application/query/get-importable-items.use-case'
import { ScanItemUrlUseCase } from '../application/query/scan-item-url.use-case'
import { itemMapper } from './item.mapper'
import {
  CreateItemInputSchema,
  ImportItemsInputSchema,
  ItemIdSchema,
  ScanItemUrlInputSchema,
  UpdateItemInputSchema,
  WishlistIdSchema,
} from './item.schema'

@Resolver('Item')
export class ItemResolver {
  private readonly logger = new Logger(ItemResolver.name)

  constructor(
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly deleteItemUseCase: DeleteItemUseCase,
    private readonly toggleItemUseCase: ToggleItemUseCase,
    private readonly scanItemUrlUseCase: ScanItemUrlUseCase,
    private readonly getImportableItemsUseCase: GetImportableItemsUseCase,
    private readonly importItemsUseCase: ImportItemsUseCase,
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

  @Query()
  async getImportableItems(
    @Args('wishlistId', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetImportableItemsOutput> {
    const items = await this.getImportableItemsUseCase.execute({ userId: currentUser.id, wishlistId })

    return {
      __typename: 'GetImportableItemsOutput',
      items: items.map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested: false })),
    }
  }

  @Mutation()
  async importItems(
    @Args('input', new ZodPipe(ImportItemsInputSchema)) input: ImportItemsInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<ImportItemsResult> {
    const items = await this.importItemsUseCase.execute({
      currentUser,
      wishlistId: input.wishlistId,
      sourceItemIds: input.sourceItemIds,
    })

    return {
      __typename: 'ImportItemsOutput',
      items: items.map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested: false })),
    }
  }

  @Mutation()
  async createItem(
    @Args('input', new ZodPipe(CreateItemInputSchema)) input: CreateItemInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<CreateItemResult> {
    const item = await this.createItemUseCase.execute({
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

    return itemMapper.toGqlItem({ item, displayUserAndSuggested: true })
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
