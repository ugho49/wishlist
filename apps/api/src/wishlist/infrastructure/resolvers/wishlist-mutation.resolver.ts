import type { ICurrentUser } from '@wishlist/common'

import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { ZodPipe } from '@wishlist/api/core'
import { EventId, WishlistId } from '@wishlist/common'

import {
  AddWishlistCoOwnerInput,
  AddWishlistCoOwnerResult,
  DeleteWishlistResult,
  LinkWishlistToEventResult,
  RemoveWishlistCoOwnerResult,
  RemoveWishlistLogoResult,
  UnlinkWishlistFromEventResult,
  UpdateWishlistInput,
  UpdateWishlistResult,
} from '../../../gql/generated-types'
import { AddCoOwnerUseCase } from '../../application/command/add-co-owner.use-case'
import { DeleteWishlistUseCase } from '../../application/command/delete-wishlist.use-case'
import { LinkWishlistToEventUseCase } from '../../application/command/link-wishlist-to-event.use-case'
import { RemoveCoOwnerUseCase } from '../../application/command/remove-co-owner.use-case'
import { RemoveWishlistLogoUseCase } from '../../application/command/remove-wishlist-logo.use-case'
import { UnlinkWishlistFromEventUseCase } from '../../application/command/unlink-wishlist-from-event.use-case'
import { UpdateWishlistUseCase } from '../../application/command/update-wishlist.use-case'
import {
  AddWishlistCoOwnerInputSchema,
  EventIdSchema,
  UpdateWishlistInputSchema,
  WishlistIdSchema,
} from '../wishlist.schema'

@Resolver()
export class WishlistMutationResolver {
  constructor(
    private readonly updateWishlistUseCase: UpdateWishlistUseCase,
    private readonly deleteWishlistUseCase: DeleteWishlistUseCase,
    private readonly linkWishlistToEventUseCase: LinkWishlistToEventUseCase,
    private readonly unlinkWishlistFromEventUseCase: UnlinkWishlistFromEventUseCase,
    private readonly addCoOwnerUseCase: AddCoOwnerUseCase,
    private readonly removeCoOwnerUseCase: RemoveCoOwnerUseCase,
    private readonly removeWishlistLogoUseCase: RemoveWishlistLogoUseCase,
  ) {}

  @Mutation()
  async updateWishlist(
    @Args('id', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @Args('input', new ZodPipe(UpdateWishlistInputSchema)) input: UpdateWishlistInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateWishlistResult> {
    await this.updateWishlistUseCase.execute({
      wishlistId,
      currentUser,
      updateWishlist: { title: input.title, description: input.description ?? undefined },
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async deleteWishlist(
    @Args('id', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<DeleteWishlistResult> {
    await this.deleteWishlistUseCase.execute({ wishlistId, currentUser })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async linkWishlistToEvent(
    @Args('id', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<LinkWishlistToEventResult> {
    await this.linkWishlistToEventUseCase.execute({ wishlistId, currentUser, eventId })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async unlinkWishlistFromEvent(
    @Args('id', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UnlinkWishlistFromEventResult> {
    await this.unlinkWishlistFromEventUseCase.execute({ wishlistId, currentUser, eventId })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async addWishlistCoOwner(
    @Args('id', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @Args('input', new ZodPipe(AddWishlistCoOwnerInputSchema)) input: AddWishlistCoOwnerInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AddWishlistCoOwnerResult> {
    await this.addCoOwnerUseCase.execute({ wishlistId, currentUser, coOwnerId: input.userId })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async removeWishlistCoOwner(
    @Args('id', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<RemoveWishlistCoOwnerResult> {
    await this.removeCoOwnerUseCase.execute({ wishlistId, currentUser })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async removeWishlistLogo(
    @Args('id', new ZodPipe(WishlistIdSchema)) wishlistId: WishlistId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<RemoveWishlistLogoResult> {
    await this.removeWishlistLogoUseCase.execute({ wishlistId, currentUser })
    return { __typename: 'VoidOutput', success: true }
  }
}
