/* ********************************************************** */
/*   THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)    */
/* ********************************************************** */


import type { Ids } from '@wishlist/common'
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AttendeeId: { input: Ids["AttendeeId"]; output: Ids["AttendeeId"]; }
  EventId: { input: Ids["EventId"]; output: Ids["EventId"]; }
  ItemId: { input: Ids["ItemId"]; output: Ids["ItemId"]; }
  UserId: { input: Ids["UserId"]; output: Ids["UserId"]; }
  UserSocialId: { input: Ids["UserSocialId"]; output: Ids["UserSocialId"]; }
  WishlistId: { input: Ids["WishlistId"]; output: Ids["WishlistId"]; }
};

export enum AttendeeRole {
  Maintainer = 'MAINTAINER',
  User = 'USER'
}

export type Event = {
  __typename: 'Event';
  attendeeIds: Array<Scalars['AttendeeId']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  eventDate: Scalars['String']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['EventId']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  wishlistIds: Array<Scalars['WishlistId']['output']>;
};

export type EventAttendee = {
  __typename: 'EventAttendee';
  id: Scalars['AttendeeId']['output'];
  pendingEmail?: Maybe<Scalars['String']['output']>;
  role: AttendeeRole;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['UserId']['output']>;
};

export type EventPaginationFilters = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  onlyFuture?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type FieldError = {
  __typename: 'FieldError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type ForbiddenRejection = {
  __typename: 'ForbiddenRejection';
  message: Scalars['String']['output'];
};

export type GetCurrentUserResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | User;

export type GetEventByIdResult = Event | ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection;

export type GetEventsPagedResponse = {
  __typename: 'GetEventsPagedResponse';
  data: Array<Event>;
  pagination: Pagination;
};

export type GetMyEventsResult = ForbiddenRejection | GetEventsPagedResponse | InternalErrorRejection | UnauthorizedRejection;

export type GetMyWishlistsResult = ForbiddenRejection | GetWishlistsPagedResponse | InternalErrorRejection | UnauthorizedRejection;

export type GetWishlistByIdResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | Wishlist;

export type GetWishlistsPagedResponse = {
  __typename: 'GetWishlistsPagedResponse';
  data: Array<Wishlist>;
  pagination: Pagination;
};

export type HealthResult = {
  __typename: 'HealthResult';
  status: HealthStatus;
};

export enum HealthStatus {
  Error = 'ERROR',
  Ok = 'OK',
  ShuttingDown = 'SHUTTING_DOWN'
}

export type InternalErrorRejection = {
  __typename: 'InternalErrorRejection';
  message: Scalars['String']['output'];
};

export type Item = {
  __typename: 'Item';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ItemId']['output'];
  isSuggested?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  pictureUrl?: Maybe<Scalars['String']['output']>;
  score?: Maybe<Scalars['Int']['output']>;
  takenAt?: Maybe<Scalars['String']['output']>;
  takenById?: Maybe<Scalars['UserId']['output']>;
  takerUser?: Maybe<User>;
  url?: Maybe<Scalars['String']['output']>;
};

export type LinkUserToGoogleInput = {
  code: Scalars['String']['input'];
};

export type LinkUserToGoogleResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | UserSocial | ValidationRejection;

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginOutput = {
  __typename: 'LoginOutput';
  accessToken: Scalars['String']['output'];
};

export type LoginResult = InternalErrorRejection | LoginOutput | UnauthorizedRejection | ValidationRejection;

export type LoginWithGoogleInput = {
  code: Scalars['String']['input'];
  createUserIfNotExists: Scalars['Boolean']['input'];
};

export type LoginWithGoogleOutput = {
  __typename: 'LoginWithGoogleOutput';
  accessToken: Scalars['String']['output'];
  linkedToExistingUser?: Maybe<Scalars['Boolean']['output']>;
  newUserCreated?: Maybe<Scalars['Boolean']['output']>;
};

export type LoginWithGoogleResult = InternalErrorRejection | LoginWithGoogleOutput | UnauthorizedRejection | ValidationRejection;

export type Mutation = {
  __typename: 'Mutation';
  linkCurrentUserlWithGoogle: LinkUserToGoogleResult;
  login: LoginResult;
  loginWithGoogle: LoginWithGoogleResult;
  registerUser: RegisterUserResult;
  unlinkCurrentUserSocial: UnlinkCurrentUserSocialResult;
  updateUserProfile: UpdateUserProfileResult;
};


export type MutationLinkCurrentUserlWithGoogleArgs = {
  input: LinkUserToGoogleInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLoginWithGoogleArgs = {
  input: LoginWithGoogleInput;
};


export type MutationRegisterUserArgs = {
  input: RegisterUserInput;
};


export type MutationUnlinkCurrentUserSocialArgs = {
  socialId: Scalars['UserSocialId']['input'];
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};

export type NotFoundRejection = {
  __typename: 'NotFoundRejection';
  message: Scalars['String']['output'];
};

export type Pagination = {
  __typename: 'Pagination';
  pageNumber: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalElements: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginationFilters = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename: 'Query';
  getCurrentUser: GetCurrentUserResult;
  getEventById?: Maybe<GetEventByIdResult>;
  getMyEvents: GetMyEventsResult;
  getMyWishlists: GetMyWishlistsResult;
  getWishlistById?: Maybe<GetWishlistByIdResult>;
  health: HealthResult;
};


export type QueryGetEventByIdArgs = {
  id: Scalars['EventId']['input'];
};


export type QueryGetMyEventsArgs = {
  filters: EventPaginationFilters;
};


export type QueryGetMyWishlistsArgs = {
  filters: PaginationFilters;
};


export type QueryGetWishlistByIdArgs = {
  id: Scalars['WishlistId']['input'];
};

export type RegisterUserInput = {
  birthday?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RegisterUserResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | User | ValidationRejection;

export type UnauthorizedRejection = {
  __typename: 'UnauthorizedRejection';
  message: Scalars['String']['output'];
};

export type UnlinkCurrentUserSocialResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UpdateUserProfileInput = {
  birthday?: InputMaybe<Scalars['String']['input']>;
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
};

export type UpdateUserProfileResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | User | ValidationRejection;

export type User = {
  __typename: 'User';
  birthday?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['UserId']['output'];
  isEnabled: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  pictureUrl?: Maybe<Scalars['String']['output']>;
  socials?: Maybe<Array<UserSocial>>;
  updatedAt: Scalars['String']['output'];
};

export type UserSocial = {
  __typename: 'UserSocial';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['UserSocialId']['output'];
  name?: Maybe<Scalars['String']['output']>;
  pictureUrl?: Maybe<Scalars['String']['output']>;
  socialType: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ValidationRejection = {
  __typename: 'ValidationRejection';
  errors: Array<FieldError>;
};

export type VoidOutput = {
  __typename: 'VoidOutput';
  success: Scalars['Boolean']['output'];
};

export type Wishlist = {
  __typename: 'Wishlist';
  coOwnerId?: Maybe<Scalars['UserId']['output']>;
  config: WishlistConfig;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  eventIds: Array<Scalars['EventId']['output']>;
  id: Scalars['WishlistId']['output'];
  items: Array<Item>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  ownerId: Scalars['UserId']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type WishlistConfig = {
  __typename: 'WishlistConfig';
  hideItems: Scalars['Boolean']['output'];
};
