import { Injectable } from '@nestjs/common'
import { AttendeeId, EventId, ICurrentUser, UserId, UserSocialId, WishlistId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { EventDataLoaderFactory } from '../event/infrastructure/event.dataloader'
import { EventAttendeeDataLoaderFactory } from '../event/infrastructure/event-attendee.dataloader'
import { Event, EventAttendee, User, UserFull, UserSocial, Wishlist } from '../gql/generated-types'
import { UserDataLoaderFactory } from '../user/infrastructure/user.dataloader'
import { WishlistDataLoaderFactory } from '../wishlist/infrastructure/wishlist.dataloader'

export type DataLoaders = {
  user: DataLoader<UserId, User | null>
  userFull: DataLoader<UserId, UserFull | null>
  userSocialsByUser: DataLoader<UserId, UserSocial[]>
  userSocial: DataLoader<UserSocialId, UserSocial | null>
  wishlist: DataLoader<WishlistId, Wishlist | null>
  event: DataLoader<EventId, Event | null>
  eventAttendee: DataLoader<AttendeeId, EventAttendee | null>
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
      userFull: this.userDataLoaderFactory.createUserFullLoader(),
      userSocialsByUser: this.userDataLoaderFactory.createUserSocialsByUserLoader(),
      userSocial: this.userDataLoaderFactory.createUserSocialLoader(),
      wishlist: this.wishlistDataLoaderFactory.createLoader(getCurrentUser),
      event: this.eventDataLoaderFactory.createLoader(getCurrentUser),
      eventAttendee: this.eventAttendeeDataLoaderFactory.createLoader(),
    }
  }
}
