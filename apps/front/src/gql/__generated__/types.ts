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
  SecretSantaId: { input: Ids["SecretSantaId"]; output: Ids["SecretSantaId"]; }
  SecretSantaUserId: { input: Ids["SecretSantaUserId"]; output: Ids["SecretSantaUserId"]; }
  UserId: { input: Ids["UserId"]; output: Ids["UserId"]; }
  UserSocialId: { input: Ids["UserSocialId"]; output: Ids["UserSocialId"]; }
  WishlistId: { input: Ids["WishlistId"]; output: Ids["WishlistId"]; }
};

export type AddEventAttendeeInput = {
  email: Scalars['String']['input'];
  role?: InputMaybe<AttendeeRole>;
};

export type AddEventAttendeeResult = EventAttendee | ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection;

export type AddSecretSantaUsersInput = {
  attendeeIds: Array<Scalars['AttendeeId']['input']>;
};

export type AddSecretSantaUsersOutput = {
  __typename?: 'AddSecretSantaUsersOutput';
  users: Array<SecretSantaUser>;
};

export type AddSecretSantaUsersResult = AddSecretSantaUsersOutput | ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection;

export type AddWishlistCoOwnerInput = {
  userId: Scalars['UserId']['input'];
};

export type AddWishlistCoOwnerResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type AdminDeleteEventAttendeeResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type AdminDeleteEventResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type AdminDeleteUserResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type AdminEventPaginationFilters = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  userId?: InputMaybe<Scalars['UserId']['input']>;
};

export type AdminGetAllUsers = {
  __typename?: 'AdminGetAllUsers';
  data: Array<UserFull>;
  pagination: Pagination;
};

export type AdminGetAllUsersPaginationFilters = {
  criteria?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminGetAllUsersResult = AdminGetAllUsers | ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection;

export type AdminGetEventByIdResult = Event | ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection;

export type AdminGetEventsResult = ForbiddenRejection | GetEventsPagedResponse | InternalErrorRejection | UnauthorizedRejection | ValidationRejection;

export type AdminGetUserByIdResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | UserFull | ValidationRejection;

export type AdminGetWishlists = {
  __typename?: 'AdminGetWishlists';
  data: Array<Wishlist>;
  pagination: Pagination;
};

export type AdminGetWishlistsResult = AdminGetWishlists | ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection;

export type AdminRemoveUserPictureResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type AdminUpdateEventResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type AdminUpdateUserProfileInput = {
  birthday?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstname?: InputMaybe<Scalars['String']['input']>;
  isEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  lastname?: InputMaybe<Scalars['String']['input']>;
  newPassword?: InputMaybe<Scalars['String']['input']>;
};

export type AdminUpdateUserProfileResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type AdminWishlistPaginationFilters = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['UserId']['input'];
};

export enum AttendeeRole {
  Maintainer = 'MAINTAINER',
  User = 'USER'
}

export type CancelSecretSantaResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | VoidOutput;

export type ChangeUserPasswordInput = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type ChangeUserPasswordResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type ClosestFriendsOutput = {
  __typename?: 'ClosestFriendsOutput';
  users: Array<User>;
};

export type ClosestFriendsResult = ClosestFriendsOutput | ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection;

export type ConfirmEmailChangeInput = {
  newEmail: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type ConfirmEmailChangeResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type CreateEventAttendeeInput = {
  email: Scalars['String']['input'];
  role?: InputMaybe<AttendeeRole>;
};

export type CreateEventInput = {
  attendees?: InputMaybe<Array<CreateEventAttendeeInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  eventDate: Scalars['String']['input'];
  icon?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateEventResult = Event | ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection;

export type CreateItemInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pictureUrl?: InputMaybe<Scalars['String']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  wishlistId: Scalars['WishlistId']['input'];
};

export type CreateItemResult = ForbiddenRejection | InternalErrorRejection | Item | UnauthorizedRejection | ValidationRejection;

export type CreateSecretSantaInput = {
  budget?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eventId: Scalars['EventId']['input'];
};

export type CreateSecretSantaResult = ForbiddenRejection | InternalErrorRejection | SecretSanta | UnauthorizedRejection | ValidationRejection;

export type DeleteEventResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type DeleteItemResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type DeleteSecretSantaResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | VoidOutput;

export type DeleteSecretSantaUserResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | VoidOutput;

export type DeleteWishlistResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type Event = {
  __typename?: 'Event';
  attendeeIds: Array<Scalars['AttendeeId']['output']>;
  attendees: Array<EventAttendee>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  eventDate: Scalars['String']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['EventId']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  wishlistIds: Array<Scalars['WishlistId']['output']>;
  wishlists: Array<Wishlist>;
};

export type EventAttendee = {
  __typename?: 'EventAttendee';
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
  __typename?: 'FieldError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type ForbiddenRejection = {
  __typename?: 'ForbiddenRejection';
  message: Scalars['String']['output'];
};

export type GetCurrentUserResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | User;

export type GetEventByIdResult = Event | ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection;

export type GetEventsPagedResponse = {
  __typename?: 'GetEventsPagedResponse';
  data: Array<Event>;
  pagination: Pagination;
};

export type GetImportableItemsOutput = {
  __typename?: 'GetImportableItemsOutput';
  items: Array<Item>;
};

export type GetImportableItemsResult = ForbiddenRejection | GetImportableItemsOutput | InternalErrorRejection | UnauthorizedRejection;

export type GetMyEventsResult = ForbiddenRejection | GetEventsPagedResponse | InternalErrorRejection | UnauthorizedRejection;

export type GetMySecretSantaDrawResult = EventAttendee | ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection;

export type GetMyWishlistsResult = ForbiddenRejection | GetWishlistsPagedResponse | InternalErrorRejection | UnauthorizedRejection;

export type GetPendingEmailChangeResult = ForbiddenRejection | InternalErrorRejection | PendingEmailChange | UnauthorizedRejection;

export type GetSecretSantaForEventResult = ForbiddenRejection | InternalErrorRejection | SecretSanta | UnauthorizedRejection;

export type GetWishlistByIdResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | Wishlist;

export type GetWishlistsPagedResponse = {
  __typename?: 'GetWishlistsPagedResponse';
  data: Array<Wishlist>;
  pagination: Pagination;
};

export type HealthResult = {
  __typename?: 'HealthResult';
  status: HealthStatus;
};

export enum HealthStatus {
  Error = 'ERROR',
  Ok = 'OK',
  ShuttingDown = 'SHUTTING_DOWN'
}

export type ImportItemsInput = {
  sourceItemIds: Array<Scalars['ItemId']['input']>;
  wishlistId: Scalars['WishlistId']['input'];
};

export type ImportItemsOutput = {
  __typename?: 'ImportItemsOutput';
  items: Array<Item>;
};

export type ImportItemsResult = ForbiddenRejection | ImportItemsOutput | InternalErrorRejection | UnauthorizedRejection | ValidationRejection;

export type InternalErrorRejection = {
  __typename?: 'InternalErrorRejection';
  message: Scalars['String']['output'];
};

export type Item = {
  __typename?: 'Item';
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

export type LinkWishlistToEventResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginOutput = {
  __typename?: 'LoginOutput';
  accessToken: Scalars['String']['output'];
};

export type LoginResult = InternalErrorRejection | LoginOutput | UnauthorizedRejection | ValidationRejection;

export type LoginWithGoogleInput = {
  code: Scalars['String']['input'];
  createUserIfNotExists: Scalars['Boolean']['input'];
};

export type LoginWithGoogleOutput = {
  __typename?: 'LoginWithGoogleOutput';
  accessToken: Scalars['String']['output'];
  linkedToExistingUser?: Maybe<Scalars['Boolean']['output']>;
  newUserCreated?: Maybe<Scalars['Boolean']['output']>;
};

export type LoginWithGoogleResult = InternalErrorRejection | LoginWithGoogleOutput | UnauthorizedRejection | ValidationRejection;

export type Mutation = {
  __typename?: 'Mutation';
  addEventAttendee: AddEventAttendeeResult;
  addSecretSantaUsers: AddSecretSantaUsersResult;
  addWishlistCoOwner: AddWishlistCoOwnerResult;
  adminDeleteEvent: AdminDeleteEventResult;
  adminDeleteEventAttendee: AdminDeleteEventAttendeeResult;
  adminDeleteUser: AdminDeleteUserResult;
  adminRemoveUserPicture: AdminRemoveUserPictureResult;
  adminUpdateEvent: AdminUpdateEventResult;
  adminUpdateUserProfile: AdminUpdateUserProfileResult;
  cancelSecretSanta: CancelSecretSantaResult;
  changeUserPassword: ChangeUserPasswordResult;
  confirmEmailChange: ConfirmEmailChangeResult;
  createEvent: CreateEventResult;
  createItem: CreateItemResult;
  createSecretSanta: CreateSecretSantaResult;
  deleteEvent: DeleteEventResult;
  deleteItem: DeleteItemResult;
  deleteSecretSanta: DeleteSecretSantaResult;
  deleteSecretSantaUser: DeleteSecretSantaUserResult;
  deleteWishlist: DeleteWishlistResult;
  importItems: ImportItemsResult;
  linkCurrentUserWithGoogle: LinkUserToGoogleResult;
  linkWishlistToEvent: LinkWishlistToEventResult;
  login: LoginResult;
  loginWithGoogle: LoginWithGoogleResult;
  registerUser: RegisterUserResult;
  removeEventAttendee: RemoveEventAttendeeResult;
  removeUserPicture: RemoveUserPictureResult;
  removeWishlistCoOwner: RemoveWishlistCoOwnerResult;
  removeWishlistLogo: RemoveWishlistLogoResult;
  requestEmailChange: RequestEmailChangeResult;
  resetPassword: ResetPasswordResult;
  scanItemUrl: ScanItemUrlResult;
  sendResetPasswordEmail: SendResetPasswordEmailResult;
  startSecretSanta: StartSecretSantaResult;
  toggleItem: ToggleItemResult;
  unlinkCurrentUserSocial: UnlinkCurrentUserSocialResult;
  unlinkWishlistFromEvent: UnlinkWishlistFromEventResult;
  updateEvent: UpdateEventResult;
  updateItem: UpdateItemResult;
  updateSecretSanta: UpdateSecretSantaResult;
  updateSecretSantaUser: UpdateSecretSantaUserResult;
  updateUserEmailSettings: UpdateUserEmailSettingsResult;
  updateUserPictureFromSocial: UpdateUserPictureFromSocialResult;
  updateUserProfile: UpdateUserProfileResult;
  updateWishlist: UpdateWishlistResult;
};


export type MutationAddEventAttendeeArgs = {
  eventId: Scalars['EventId']['input'];
  input: AddEventAttendeeInput;
};


export type MutationAddSecretSantaUsersArgs = {
  id: Scalars['SecretSantaId']['input'];
  input: AddSecretSantaUsersInput;
};


export type MutationAddWishlistCoOwnerArgs = {
  id: Scalars['WishlistId']['input'];
  input: AddWishlistCoOwnerInput;
};


export type MutationAdminDeleteEventArgs = {
  id: Scalars['EventId']['input'];
};


export type MutationAdminDeleteEventAttendeeArgs = {
  attendeeId: Scalars['AttendeeId']['input'];
  eventId: Scalars['EventId']['input'];
};


export type MutationAdminDeleteUserArgs = {
  userId: Scalars['UserId']['input'];
};


export type MutationAdminRemoveUserPictureArgs = {
  userId: Scalars['UserId']['input'];
};


export type MutationAdminUpdateEventArgs = {
  id: Scalars['EventId']['input'];
  input: UpdateEventInput;
};


export type MutationAdminUpdateUserProfileArgs = {
  input: AdminUpdateUserProfileInput;
  userId: Scalars['UserId']['input'];
};


export type MutationCancelSecretSantaArgs = {
  id: Scalars['SecretSantaId']['input'];
};


export type MutationChangeUserPasswordArgs = {
  input: ChangeUserPasswordInput;
};


export type MutationConfirmEmailChangeArgs = {
  input: ConfirmEmailChangeInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateItemArgs = {
  input: CreateItemInput;
};


export type MutationCreateSecretSantaArgs = {
  input: CreateSecretSantaInput;
};


export type MutationDeleteEventArgs = {
  id: Scalars['EventId']['input'];
};


export type MutationDeleteItemArgs = {
  itemId: Scalars['ItemId']['input'];
};


export type MutationDeleteSecretSantaArgs = {
  id: Scalars['SecretSantaId']['input'];
};


export type MutationDeleteSecretSantaUserArgs = {
  id: Scalars['SecretSantaId']['input'];
  secretSantaUserId: Scalars['SecretSantaUserId']['input'];
};


export type MutationDeleteWishlistArgs = {
  id: Scalars['WishlistId']['input'];
};


export type MutationImportItemsArgs = {
  input: ImportItemsInput;
};


export type MutationLinkCurrentUserWithGoogleArgs = {
  input: LinkUserToGoogleInput;
};


export type MutationLinkWishlistToEventArgs = {
  eventId: Scalars['EventId']['input'];
  id: Scalars['WishlistId']['input'];
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


export type MutationRemoveEventAttendeeArgs = {
  attendeeId: Scalars['AttendeeId']['input'];
  eventId: Scalars['EventId']['input'];
};


export type MutationRemoveWishlistCoOwnerArgs = {
  id: Scalars['WishlistId']['input'];
};


export type MutationRemoveWishlistLogoArgs = {
  id: Scalars['WishlistId']['input'];
};


export type MutationRequestEmailChangeArgs = {
  input: RequestEmailChangeInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationScanItemUrlArgs = {
  input: ScanItemUrlInput;
};


export type MutationSendResetPasswordEmailArgs = {
  input: SendResetPasswordEmailInput;
};


export type MutationStartSecretSantaArgs = {
  id: Scalars['SecretSantaId']['input'];
};


export type MutationToggleItemArgs = {
  itemId: Scalars['ItemId']['input'];
};


export type MutationUnlinkCurrentUserSocialArgs = {
  socialId: Scalars['UserSocialId']['input'];
};


export type MutationUnlinkWishlistFromEventArgs = {
  eventId: Scalars['EventId']['input'];
  id: Scalars['WishlistId']['input'];
};


export type MutationUpdateEventArgs = {
  id: Scalars['EventId']['input'];
  input: UpdateEventInput;
};


export type MutationUpdateItemArgs = {
  input: UpdateItemInput;
  itemId: Scalars['ItemId']['input'];
};


export type MutationUpdateSecretSantaArgs = {
  id: Scalars['SecretSantaId']['input'];
  input: UpdateSecretSantaInput;
};


export type MutationUpdateSecretSantaUserArgs = {
  id: Scalars['SecretSantaId']['input'];
  input: UpdateSecretSantaUserInput;
  secretSantaUserId: Scalars['SecretSantaUserId']['input'];
};


export type MutationUpdateUserEmailSettingsArgs = {
  input: UpdateUserEmailSettingsInput;
};


export type MutationUpdateUserPictureFromSocialArgs = {
  input: UpdateUserPictureFromSocialInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUpdateWishlistArgs = {
  id: Scalars['WishlistId']['input'];
  input: UpdateWishlistInput;
};

export type NotFoundRejection = {
  __typename?: 'NotFoundRejection';
  message: Scalars['String']['output'];
};

export type Pagination = {
  __typename?: 'Pagination';
  pageNumber: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  totalElements: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginationFilters = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type PendingEmailChange = {
  __typename?: 'PendingEmailChange';
  expiredAt: Scalars['String']['output'];
  newEmail: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  adminEvent: AdminGetEventByIdResult;
  adminEvents: AdminGetEventsResult;
  adminUser: AdminGetUserByIdResult;
  adminUsers: AdminGetAllUsersResult;
  adminWishlists: AdminGetWishlistsResult;
  closestFriends: ClosestFriendsResult;
  currentUser: GetCurrentUserResult;
  event?: Maybe<GetEventByIdResult>;
  events: GetMyEventsResult;
  health: HealthResult;
  importableItems: GetImportableItemsResult;
  mySecretSantaDraw?: Maybe<GetMySecretSantaDrawResult>;
  pendingEmailChange?: Maybe<GetPendingEmailChangeResult>;
  searchUsers: SearchUsersResult;
  secretSanta?: Maybe<GetSecretSantaForEventResult>;
  wishlist?: Maybe<GetWishlistByIdResult>;
  wishlists: GetMyWishlistsResult;
};


export type QueryAdminEventArgs = {
  id: Scalars['EventId']['input'];
};


export type QueryAdminEventsArgs = {
  filters: AdminEventPaginationFilters;
};


export type QueryAdminUserArgs = {
  userId: Scalars['UserId']['input'];
};


export type QueryAdminUsersArgs = {
  input?: InputMaybe<AdminGetAllUsersPaginationFilters>;
};


export type QueryAdminWishlistsArgs = {
  filters: AdminWishlistPaginationFilters;
};


export type QueryClosestFriendsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEventArgs = {
  id: Scalars['EventId']['input'];
};


export type QueryEventsArgs = {
  filters: EventPaginationFilters;
};


export type QueryImportableItemsArgs = {
  wishlistId: Scalars['WishlistId']['input'];
};


export type QueryMySecretSantaDrawArgs = {
  eventId: Scalars['EventId']['input'];
};


export type QuerySearchUsersArgs = {
  keyword: Scalars['String']['input'];
};


export type QuerySecretSantaArgs = {
  eventId: Scalars['EventId']['input'];
};


export type QueryWishlistArgs = {
  id: Scalars['WishlistId']['input'];
};


export type QueryWishlistsArgs = {
  filters: PaginationFilters;
};

export type RegisterUserInput = {
  birthday?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RegisterUserResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | User | ValidationRejection;

export type RemoveEventAttendeeResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type RemoveUserPictureResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type RemoveWishlistCoOwnerResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type RemoveWishlistLogoResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type RequestEmailChangeInput = {
  newEmail: Scalars['String']['input'];
};

export type RequestEmailChangeResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type ResetPasswordInput = {
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type ResetPasswordResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type ScanItemUrlInput = {
  url: Scalars['String']['input'];
};

export type ScanItemUrlOutput = {
  __typename?: 'ScanItemUrlOutput';
  pictureUrl?: Maybe<Scalars['String']['output']>;
};

export type ScanItemUrlResult = ForbiddenRejection | InternalErrorRejection | ScanItemUrlOutput | UnauthorizedRejection | ValidationRejection;

export type SearchUsersOutput = {
  __typename?: 'SearchUsersOutput';
  users: Array<User>;
};

export type SearchUsersResult = ForbiddenRejection | InternalErrorRejection | SearchUsersOutput | UnauthorizedRejection | ValidationRejection;

export type SecretSanta = {
  __typename?: 'SecretSanta';
  budget?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  event: Event;
  eventId: Scalars['EventId']['output'];
  id: Scalars['SecretSantaId']['output'];
  status: SecretSantaStatus;
  updatedAt: Scalars['String']['output'];
  users: Array<SecretSantaUser>;
};

export enum SecretSantaStatus {
  Created = 'CREATED',
  Started = 'STARTED'
}

export type SecretSantaUser = {
  __typename?: 'SecretSantaUser';
  attendee: EventAttendee;
  attendeeId: Scalars['AttendeeId']['output'];
  exclusions: Array<Scalars['SecretSantaUserId']['output']>;
  id: Scalars['SecretSantaUserId']['output'];
};

export type SendResetPasswordEmailInput = {
  email: Scalars['String']['input'];
};

export type SendResetPasswordEmailResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type StartSecretSantaResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type ToggleItemOutput = {
  __typename?: 'ToggleItemOutput';
  takenAt?: Maybe<Scalars['String']['output']>;
  takenById?: Maybe<Scalars['UserId']['output']>;
};

export type ToggleItemResult = ForbiddenRejection | InternalErrorRejection | ToggleItemOutput | UnauthorizedRejection | ValidationRejection;

export type UnauthorizedRejection = {
  __typename?: 'UnauthorizedRejection';
  message: Scalars['String']['output'];
};

export type UnlinkCurrentUserSocialResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UnlinkWishlistFromEventResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UpdateEventInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  eventDate: Scalars['String']['input'];
  icon?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type UpdateEventResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UpdateItemInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pictureUrl?: InputMaybe<Scalars['String']['input']>;
  score?: InputMaybe<Scalars['Int']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateItemResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UpdateSecretSantaInput = {
  budget?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSecretSantaResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UpdateSecretSantaUserInput = {
  exclusions: Array<Scalars['SecretSantaUserId']['input']>;
};

export type UpdateSecretSantaUserResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UpdateUserEmailSettingsInput = {
  dailyNewItemNotification: Scalars['Boolean']['input'];
};

export type UpdateUserEmailSettingsResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | UserEmailSettings | ValidationRejection;

export type UpdateUserPictureFromSocialInput = {
  socialId: Scalars['UserSocialId']['input'];
};

export type UpdateUserPictureFromSocialResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type UpdateUserProfileInput = {
  birthday?: InputMaybe<Scalars['String']['input']>;
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
};

export type UpdateUserProfileResult = ForbiddenRejection | InternalErrorRejection | UnauthorizedRejection | User | ValidationRejection;

export type UpdateWishlistInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type UpdateWishlistResult = ForbiddenRejection | InternalErrorRejection | NotFoundRejection | UnauthorizedRejection | ValidationRejection | VoidOutput;

export type User = {
  __typename?: 'User';
  birthday?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailSettings?: Maybe<UserEmailSettings>;
  firstName: Scalars['String']['output'];
  id: Scalars['UserId']['output'];
  isEnabled: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  pictureUrl?: Maybe<Scalars['String']['output']>;
  socials?: Maybe<Array<UserSocial>>;
  updatedAt: Scalars['String']['output'];
};

export enum UserAuthorities {
  RoleAdmin = 'ROLE_ADMIN',
  RoleSuperadmin = 'ROLE_SUPERADMIN',
  RoleUser = 'ROLE_USER'
}

export type UserEmailSettings = {
  __typename?: 'UserEmailSettings';
  dailyNewItemNotification: Scalars['Boolean']['output'];
};

export type UserFull = {
  __typename?: 'UserFull';
  authorities: Array<UserAuthorities>;
  birthday?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['UserId']['output'];
  isEnabled: Scalars['Boolean']['output'];
  lastConnectedAt?: Maybe<Scalars['String']['output']>;
  lastIp?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  pictureUrl?: Maybe<Scalars['String']['output']>;
  socials: Array<UserSocial>;
  updatedAt: Scalars['String']['output'];
};

export type UserSocial = {
  __typename?: 'UserSocial';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['UserSocialId']['output'];
  name?: Maybe<Scalars['String']['output']>;
  pictureUrl?: Maybe<Scalars['String']['output']>;
  socialType: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ValidationRejection = {
  __typename?: 'ValidationRejection';
  errors: Array<FieldError>;
};

export type VoidOutput = {
  __typename?: 'VoidOutput';
  success: Scalars['Boolean']['output'];
};

export type Wishlist = {
  __typename?: 'Wishlist';
  coOwner?: Maybe<User>;
  coOwnerId?: Maybe<Scalars['UserId']['output']>;
  config: WishlistConfig;
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  eventIds: Array<Scalars['EventId']['output']>;
  events: Array<Event>;
  id: Scalars['WishlistId']['output'];
  items: Array<Item>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  owner: User;
  ownerId: Scalars['UserId']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type WishlistConfig = {
  __typename?: 'WishlistConfig';
  hideItems: Scalars['Boolean']['output'];
};

export type UpdateWishlistMutationVariables = Exact<{
  id: Scalars['WishlistId']['input'];
  input: UpdateWishlistInput;
}>;


export type UpdateWishlistMutation = { __typename?: 'Mutation', updateWishlist:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteWishlistMutationVariables = Exact<{
  id: Scalars['WishlistId']['input'];
}>;


export type DeleteWishlistMutation = { __typename?: 'Mutation', deleteWishlist:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type WishlistPageQueryVariables = Exact<{
  wishlistId: Scalars['WishlistId']['input'];
}>;


export type WishlistPageQuery = { __typename?: 'Query', wishlist?:
    | { __typename?: 'ForbiddenRejection' }
    | { __typename?: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename?: 'UnauthorizedRejection' }
    | { __typename?: 'Wishlist', id: Ids["WishlistId"], title: string, description?: string | null, logoUrl?: string | null, owner: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string } }
   | null };
