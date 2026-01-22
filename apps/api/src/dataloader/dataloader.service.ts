import type { GqlEvent, GqlEventAttendee } from '../event/infrastructure/event.dto'
import type { GqlUser, GqlUserSocial } from '../user/infrastructure/user.dto'
import type { GqlWishlist } from '../wishlist/infrastructure/wishlist.dto'

import { Injectable } from '@nestjs/common'
import { AttendeeId, EventId, ICurrentUser, UserId, WishlistId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { EventDataLoaderFactory } from '../event/infrastructure/event.dataloader'
import { EventAttendeeDataLoaderFactory } from '../event/infrastructure/event-attendee.dataloader'
import { UserDataLoaderFactory } from '../user/infrastructure/user.dataloader'
import { WishlistDataLoaderFactory } from '../wishlist/infrastructure/wishlist.dataloader'

export type DataLoaders = {
  user: DataLoader<UserId, GqlUser | null>
  userSocial: DataLoader<UserId, GqlUserSocial[]>
  wishlist: DataLoader<WishlistId, GqlWishlist | null>
  event: DataLoader<EventId, GqlEvent | null>
  eventAttendee: DataLoader<AttendeeId, GqlEventAttendee | null>
}

@Injectable()
export class DataLoaderService {
  constructor(
    private readonly userDataLoaderFactory: UserDataLoaderFactory,
    private readonly wishlistDataLoaderFactory: WishlistDataLoaderFactory,
    private readonly eventDataLoaderFactory: EventDataLoaderFactory,
    private readonly eventAttendeeDataLoaderFactory: EventAttendeeDataLoaderFactory,
  ) {}

  createLoaders(getCurrentUser: () => ICurrentUser | undefined): DataLoaders {
    return {
      user: this.userDataLoaderFactory.createUserLoader(),
      userSocial: this.userDataLoaderFactory.createUserSocialLoader(),
      wishlist: this.wishlistDataLoaderFactory.createLoader(getCurrentUser),
      event: this.eventDataLoaderFactory.createLoader(getCurrentUser),
      eventAttendee: this.eventAttendeeDataLoaderFactory.createLoader(),
    }
  }
}
