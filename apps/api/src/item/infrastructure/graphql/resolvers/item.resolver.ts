import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { ICurrentUser, ItemId, UserId, WishlistId } from '@wishlist/common'

import { GqlAuthGuard, GqlCurrentUser } from '../../../../graphql'
import {
  CreateItemCommand,
  DeleteItemCommand,
  GetImportableItemsQuery,
  ImportItemsCommand,
  ScanItemUrlQuery,
  ToggleItemCommand,
  UpdateItemCommand,
} from '../../../domain'
import { itemGraphQLMapper } from '../mappers'
import {
  CreateItemInput,
  ImportItemsInput,
  ItemObject,
  ScanItemResultObject,
  ScanItemUrlInput,
  ToggleItemResultObject,
  UpdateItemInput,
} from '../types'

@Resolver()
@UseGuards(GqlAuthGuard)
export class ItemResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [ItemObject], {
    name: 'importableItems',
    description: 'Get items that can be imported from old wishlists',
  })
  async importableItems(
    @GqlCurrentUser('id') userId: UserId,
    @Args('wishlistId', { type: () => ID }) wishlistId: WishlistId,
  ): Promise<ItemObject[]> {
    const items = await this.queryBus.execute(new GetImportableItemsQuery({ userId, wishlistId }))
    return items.map(itemGraphQLMapper.toItemObject)
  }

  @Mutation(() => ScanItemResultObject, { name: 'scanItemUrl', description: 'Scan a URL to extract item picture' })
  async scanItemUrl(@Args('input') input: ScanItemUrlInput): Promise<ScanItemResultObject> {
    const result = await this.queryBus.execute(new ScanItemUrlQuery({ url: input.url }))
    return {
      pictureUrl: result.picture_url ?? undefined,
    }
  }

  @Mutation(() => ItemObject, { name: 'createItem', description: 'Create a new item in a wishlist' })
  async createItem(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('input') input: CreateItemInput,
  ): Promise<ItemObject> {
    const result = await this.commandBus.execute(
      new CreateItemCommand({
        currentUser,
        wishlistId: input.wishlistId as WishlistId,
        newItem: {
          name: input.name,
          description: input.description,
          score: input.score,
          url: input.url,
          pictureUrl: input.pictureUrl,
        },
      }),
    )
    return itemGraphQLMapper.toItemObject(result)
  }

  @Mutation(() => Boolean, { name: 'updateItem', description: 'Update an existing item' })
  async updateItem(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) itemId: ItemId,
    @Args('input') input: UpdateItemInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateItemCommand({
        itemId,
        currentUser,
        updateItem: {
          name: input.name,
          description: input.description,
          score: input.score,
          url: input.url,
          pictureUrl: input.pictureUrl,
        },
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'deleteItem', description: 'Delete an item' })
  async deleteItem(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) itemId: ItemId,
  ): Promise<boolean> {
    await this.commandBus.execute(new DeleteItemCommand({ itemId, currentUser }))
    return true
  }

  @Mutation(() => ToggleItemResultObject, { name: 'toggleItem', description: 'Toggle item reservation status' })
  async toggleItem(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) itemId: ItemId,
  ): Promise<ToggleItemResultObject> {
    const result = await this.commandBus.execute(new ToggleItemCommand({ itemId, currentUser }))
    return itemGraphQLMapper.toToggleItemResultObject(result)
  }

  @Mutation(() => [ItemObject], { name: 'importItems', description: 'Import items from another wishlist' })
  async importItems(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('input') input: ImportItemsInput,
  ): Promise<ItemObject[]> {
    const items = await this.commandBus.execute(
      new ImportItemsCommand({
        currentUser,
        wishlistId: input.wishlistId as WishlistId,
        sourceItemIds: input.sourceItemIds as ItemId[],
      }),
    )
    return items.map(itemGraphQLMapper.toItemObject)
  }
}
