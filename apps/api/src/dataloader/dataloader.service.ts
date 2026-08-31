import { Injectable } from '@nestjs/common';
import {
  type AttendeeId,
  type EventId,
  type ICurrentUser,
  type UserAccountId,
  type UserId,
  type WishlistId,
} from '@wishlist/common';
import DataLoader from 'dataloader';

import { EventDataLoaderFactory } from '../event/infrastructure/event.dataloader';
import { EventAttendeeDataLoaderFactory } from '../event/infrastructure/event-attendee.dataloader';
import {
  type Event,
  type EventAttendee,
  type User,
  type UserAccount,
  type UserFull,
  type UserSession,
  type Wishlist,
} from '../gql/generated-types';
import { UserDataLoaderFactory } from '../user/infrastructure/user.dataloader';
import { WishlistDataLoaderFactory } from '../wishlist/infrastructure/wishlist.dataloader';

export type DataLoaders = {
  user: DataLoader<UserId, User | null>;
  userFull: DataLoader<UserId, UserFull | null>;
  userAccountsByUser: DataLoader<UserId, UserAccount[]>;
  userAccount: DataLoader<UserAccountId, UserAccount | null>;
  userSessionsByUser: DataLoader<UserId, UserSession[]>;
  getWishlistDataLoader: (currentUser: ICurrentUser) => DataLoader<WishlistId, Wishlist | null>;
  getEventDataLoader: (currentUser: ICurrentUser) => DataLoader<EventId, Event | null>;
  eventAttendee: DataLoader<AttendeeId, EventAttendee | null>;
};

@Injectable()
export class DataLoaderService {
  constructor(
    private readonly userDataLoaderFactory: UserDataLoaderFactory,
    private readonly wishlistDataLoaderFactory: WishlistDataLoaderFactory,
    private readonly eventDataLoaderFactory: EventDataLoaderFactory,
    private readonly eventAttendeeDataLoaderFactory: EventAttendeeDataLoaderFactory,
  ) {}

  createLoaders(): DataLoaders {
    return {
      user: this.userDataLoaderFactory.createUserLoader(),
      userFull: this.userDataLoaderFactory.createUserFullLoader(),
      userAccountsByUser: this.userDataLoaderFactory.createUserAccountsByUserLoader(),
      userAccount: this.userDataLoaderFactory.createUserAccountLoader(),
      userSessionsByUser: this.userDataLoaderFactory.createUserSessionsByUserLoader(),
      getWishlistDataLoader: (currentUser: ICurrentUser) => this.wishlistDataLoaderFactory.createLoader(currentUser),
      getEventDataLoader: (currentUser: ICurrentUser) => this.eventDataLoaderFactory.createLoader(currentUser),
      eventAttendee: this.eventAttendeeDataLoaderFactory.createLoader(),
    };
  }
}
