import type { ICurrentUser, WishlistId } from '@wishlist/common';

import { Logger } from '@nestjs/common';
import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { type ItemId, type UserId } from '@wishlist/common';

import { GqlCurrentUser } from '../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../core/graphql/graphql.context';
import { ZodPipe } from '../../core/graphql/zod-pipe';
import {
  type CreateItemInput,
  type CreateItemResult,
  type DeleteItemResult,
  type GetImportableItemsOutput,
  type ImportItemsInput,
  type ImportItemsResult,
  type ItemTaker,
  type ScanItemUrlInput,
  type ScanItemUrlResult,
  type ToggleItemResult,
  type UpdateItemInput,
  type UpdateItemResult,
  type User,
} from '../../gql/generated-types';
import { CreateItemUseCase } from '../application/command/create-item.use-case';
import { DeleteItemUseCase } from '../application/command/delete-item.use-case';
import { ImportItemsUseCase } from '../application/command/import-items.use-case';
import { ToggleItemUseCase } from '../application/command/toggle-item.use-case';
import { UpdateItemUseCase } from '../application/command/update-item.use-case';
import { GetImportableItemsUseCase } from '../application/query/get-importable-items.use-case';
import { ScanItemUrlUseCase } from '../application/query/scan-item-url.use-case';
import { itemMapper } from './item.mapper';
import {
  CreateItemInputSchema,
  ImportItemsInputSchema,
  ItemIdSchema,
  ScanItemUrlInputSchema,
  UpdateItemInputSchema,
  WishlistIdSchema,
} from './item.schema';

@Resolver('ItemTaker')
export class ItemTakerFieldResolver {
  private readonly logger = new Logger(ItemTakerFieldResolver.name);

  @ResolveField()
  async user(@Parent() taker: ItemTaker, @Context() ctx: GraphQLContext): Promise<User | undefined> {
    const user = await ctx.loaders.user.load(taker.userId as UserId);
    if (!user) {
      this.logger.warn('Taker user not found', { userId: taker.userId });
      return undefined;
    }
    return user;
  }
}

@Resolver('Item')
export class ItemResolver {
  constructor(
    private readonly createItemUseCase: CreateItemUseCase,
    private readonly updateItemUseCase: UpdateItemUseCase,
    private readonly deleteItemUseCase: DeleteItemUseCase,
    private readonly toggleItemUseCase: ToggleItemUseCase,
    private readonly scanItemUrlUseCase: ScanItemUrlUseCase,
    private readonly getImportableItemsUseCase: GetImportableItemsUseCase,
    private readonly importItemsUseCase: ImportItemsUseCase,
  ) {}

  @Query()
  async importableItems(
    @Args('wishlistId', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetImportableItemsOutput> {
    const items = await this.getImportableItemsUseCase.execute({ userId: currentUser.id, wishlistId });

    return {
      __typename: 'GetImportableItemsOutput',
      items: items.map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested: false })),
    };
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
    });

    return {
      __typename: 'ImportItemsOutput',
      items: items.map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested: false })),
    };
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
    });

    return itemMapper.toGqlItem({ item, displayUserAndSuggested: true });
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
    });

    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async deleteItem(
    @Args('itemId', new ZodPipe(ItemIdSchema)) itemId: ItemId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteItemResult> {
    await this.deleteItemUseCase.execute({ itemId, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async toggleItem(
    @Args('itemId', new ZodPipe(ItemIdSchema)) itemId: ItemId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<ToggleItemResult> {
    const { takers } = await this.toggleItemUseCase.execute({ itemId, currentUser });

    return {
      __typename: 'ToggleItemOutput',
      takers: takers.map(taker => itemMapper.toGqlItemTaker(taker)),
    };
  }

  @Mutation()
  async scanItemUrl(
    @Args('input', new ZodPipe(ScanItemUrlInputSchema)) input: ScanItemUrlInput,
  ): Promise<ScanItemUrlResult> {
    const { pictureUrl } = await this.scanItemUrlUseCase.execute({ url: input.url });

    return {
      __typename: 'ScanItemUrlOutput',
      pictureUrl,
    };
  }
}
