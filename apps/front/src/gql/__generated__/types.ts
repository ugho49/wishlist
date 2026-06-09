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

export type AuthLoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type AuthLoginMutation = { __typename?: 'Mutation', login:
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'LoginOutput', accessToken: string }
    | { __typename: 'UnauthorizedRejection', message: string }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type AuthLoginWithGoogleMutationVariables = Exact<{
  input: LoginWithGoogleInput;
}>;


export type AuthLoginWithGoogleMutation = { __typename?: 'Mutation', loginWithGoogle:
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'LoginWithGoogleOutput', accessToken: string, newUserCreated?: boolean | null, linkedToExistingUser?: boolean | null }
    | { __typename: 'UnauthorizedRejection', message: string }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type AuthRegisterUserMutationVariables = Exact<{
  input: RegisterUserInput;
}>;


export type AuthRegisterUserMutation = { __typename?: 'Mutation', registerUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], email: string }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type AuthSendResetPasswordEmailMutationVariables = Exact<{
  input: SendResetPasswordEmailInput;
}>;


export type AuthSendResetPasswordEmailMutation = { __typename?: 'Mutation', sendResetPasswordEmail:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AuthResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type AuthResetPasswordMutation = { __typename?: 'Mutation', resetPassword:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AuthConfirmEmailChangeMutationVariables = Exact<{
  input: ConfirmEmailChangeInput;
}>;


export type AuthConfirmEmailChangeMutation = { __typename?: 'Mutation', confirmEmailChange:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type EventListPageGetEventsQueryVariables = Exact<{
  filters: EventPaginationFilters;
}>;


export type EventListPageGetEventsQuery = { __typename?: 'Query', events:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetEventsPagedResponse', data: Array<{ __typename?: 'Event', id: Ids["EventId"], title: string, icon?: string | null, eventDate: string, attendeeIds: Array<Ids["AttendeeId"]>, wishlistIds: Array<Ids["WishlistId"]> }>, pagination: { __typename?: 'Pagination', totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent:
    | { __typename: 'Event', id: Ids["EventId"] }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type UpdateEventMutationVariables = Exact<{
  id: Scalars['EventId']['input'];
  input: UpdateEventInput;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteEventMutationVariables = Exact<{
  id: Scalars['EventId']['input'];
}>;


export type DeleteEventMutation = { __typename?: 'Mutation', deleteEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AddEventAttendeeMutationVariables = Exact<{
  eventId: Scalars['EventId']['input'];
  input: AddEventAttendeeInput;
}>;


export type AddEventAttendeeMutation = { __typename?: 'Mutation', addEventAttendee:
    | { __typename: 'EventAttendee', id: Ids["AttendeeId"], userId?: Ids["UserId"] | null, pendingEmail?: string | null, role: AttendeeRole, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type RemoveEventAttendeeMutationVariables = Exact<{
  eventId: Scalars['EventId']['input'];
  attendeeId: Scalars['AttendeeId']['input'];
}>;


export type RemoveEventAttendeeMutation = { __typename?: 'Mutation', removeEventAttendee:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type EventPageGetEventQueryVariables = Exact<{
  eventId: Scalars['EventId']['input'];
}>;


export type EventPageGetEventQuery = { __typename?: 'Query', event?:
    | { __typename: 'Event', id: Ids["EventId"], title: string, description?: string | null, icon?: string | null, eventDate: string, attendees: Array<{ __typename?: 'EventAttendee', id: Ids["AttendeeId"], userId?: Ids["UserId"] | null, pendingEmail?: string | null, role: AttendeeRole, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null }>, wishlists: Array<{ __typename?: 'Wishlist', id: Ids["WishlistId"], title: string, logoUrl?: string | null, config: { __typename?: 'WishlistConfig', hideItems: boolean }, owner: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, pictureUrl?: string | null } }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection', message: string }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type EventSelectAvailableEventsQueryVariables = Exact<{
  filters: EventPaginationFilters;
}>;


export type EventSelectAvailableEventsQuery = { __typename?: 'Query', events:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetEventsPagedResponse', data: Array<{ __typename?: 'Event', id: Ids["EventId"], title: string, icon?: string | null, eventDate: string }> }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   };

export type AdminEventListEventsQueryVariables = Exact<{
  filters: AdminEventPaginationFilters;
}>;


export type AdminEventListEventsQuery = { __typename?: 'Query', adminEvents:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetEventsPagedResponse', data: Array<{ __typename?: 'Event', id: Ids["EventId"], title: string, icon?: string | null, eventDate: string, wishlistIds: Array<Ids["WishlistId"]>, createdAt: string, attendees: Array<{ __typename?: 'EventAttendee', id: Ids["AttendeeId"], role: AttendeeRole, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string } | null }> }>, pagination: { __typename?: 'Pagination', totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type AdminEventGetEventQueryVariables = Exact<{
  id: Scalars['EventId']['input'];
}>;


export type AdminEventGetEventQuery = { __typename?: 'Query', adminEvent:
    | { __typename: 'Event', id: Ids["EventId"], title: string, description?: string | null, icon?: string | null, eventDate: string, createdAt: string, attendees: Array<{ __typename?: 'EventAttendee', id: Ids["AttendeeId"], userId?: Ids["UserId"] | null, pendingEmail?: string | null, role: AttendeeRole, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null }>, wishlists: Array<{ __typename?: 'Wishlist', id: Ids["WishlistId"], title: string, logoUrl?: string | null, createdAt: string, config: { __typename?: 'WishlistConfig', hideItems: boolean }, owner: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, pictureUrl?: string | null }, coOwner?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string } | null }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type AdminUpdateEventMutationVariables = Exact<{
  id: Scalars['EventId']['input'];
  input: UpdateEventInput;
}>;


export type AdminUpdateEventMutation = { __typename?: 'Mutation', adminUpdateEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminDeleteEventMutationVariables = Exact<{
  id: Scalars['EventId']['input'];
}>;


export type AdminDeleteEventMutation = { __typename?: 'Mutation', adminDeleteEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminDeleteEventAttendeeMutationVariables = Exact<{
  eventId: Scalars['EventId']['input'];
  attendeeId: Scalars['AttendeeId']['input'];
}>;


export type AdminDeleteEventAttendeeMutation = { __typename?: 'Mutation', adminDeleteEventAttendee:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type ImportableItemsQueryVariables = Exact<{
  wishlistId: Scalars['WishlistId']['input'];
}>;


export type ImportableItemsQuery = { __typename?: 'Query', importableItems:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetImportableItemsOutput', items: Array<{ __typename?: 'Item', id: Ids["ItemId"], name: string, description?: string | null, url?: string | null, score?: number | null, isSuggested?: boolean | null, pictureUrl?: string | null, takenById?: Ids["UserId"] | null, takenAt?: string | null, createdAt: string, takerUser?: { __typename?: 'User', id: Ids["UserId"], firstName: string, pictureUrl?: string | null } | null }> }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   };

export type CreateItemMutationVariables = Exact<{
  input: CreateItemInput;
}>;


export type CreateItemMutation = { __typename?: 'Mutation', createItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'Item', id: Ids["ItemId"], name: string, description?: string | null, url?: string | null, score?: number | null, isSuggested?: boolean | null, pictureUrl?: string | null, takenById?: Ids["UserId"] | null, takenAt?: string | null, createdAt: string, takerUser?: { __typename?: 'User', id: Ids["UserId"], firstName: string, pictureUrl?: string | null } | null }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type UpdateItemMutationVariables = Exact<{
  itemId: Scalars['ItemId']['input'];
  input: UpdateItemInput;
}>;


export type UpdateItemMutation = { __typename?: 'Mutation', updateItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteItemMutationVariables = Exact<{
  itemId: Scalars['ItemId']['input'];
}>;


export type DeleteItemMutation = { __typename?: 'Mutation', deleteItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type ToggleItemMutationVariables = Exact<{
  itemId: Scalars['ItemId']['input'];
}>;


export type ToggleItemMutation = { __typename?: 'Mutation', toggleItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'ToggleItemOutput', takenById?: Ids["UserId"] | null, takenAt?: string | null }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type ScanItemUrlMutationVariables = Exact<{
  input: ScanItemUrlInput;
}>;


export type ScanItemUrlMutation = { __typename?: 'Mutation', scanItemUrl:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'ScanItemUrlOutput', pictureUrl?: string | null }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type ImportItemsMutationVariables = Exact<{
  input: ImportItemsInput;
}>;


export type ImportItemsMutation = { __typename?: 'Mutation', importItems:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'ImportItemsOutput', items: Array<{ __typename?: 'Item', id: Ids["ItemId"], name: string, description?: string | null, url?: string | null, score?: number | null, isSuggested?: boolean | null, pictureUrl?: string | null, takenById?: Ids["UserId"] | null, takenAt?: string | null, createdAt: string, takerUser?: { __typename?: 'User', id: Ids["UserId"], firstName: string, pictureUrl?: string | null } | null }> }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type SecretSantaUserItemFragment = { __typename?: 'SecretSantaUser', id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { __typename?: 'EventAttendee', id: Ids["AttendeeId"], pendingEmail?: string | null, role: AttendeeRole, userId?: Ids["UserId"] | null, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null } };

export type SecretSantaItemFragment = { __typename?: 'SecretSanta', id: Ids["SecretSantaId"], eventId: Ids["EventId"], description?: string | null, budget?: number | null, status: SecretSantaStatus, createdAt: string, updatedAt: string, users: Array<{ __typename?: 'SecretSantaUser', id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { __typename?: 'EventAttendee', id: Ids["AttendeeId"], pendingEmail?: string | null, role: AttendeeRole, userId?: Ids["UserId"] | null, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null } }> };

export type GetSecretSantaForEventQueryVariables = Exact<{
  eventId: Scalars['EventId']['input'];
}>;


export type GetSecretSantaForEventQuery = { __typename?: 'Query', secretSanta?:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'SecretSanta', id: Ids["SecretSantaId"], eventId: Ids["EventId"], description?: string | null, budget?: number | null, status: SecretSantaStatus, createdAt: string, updatedAt: string, users: Array<{ __typename?: 'SecretSantaUser', id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { __typename?: 'EventAttendee', id: Ids["AttendeeId"], pendingEmail?: string | null, role: AttendeeRole, userId?: Ids["UserId"] | null, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null } }> }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type GetMySecretSantaDrawQueryVariables = Exact<{
  eventId: Scalars['EventId']['input'];
}>;


export type GetMySecretSantaDrawQuery = { __typename?: 'Query', mySecretSantaDraw?:
    | { __typename: 'EventAttendee', id: Ids["AttendeeId"], pendingEmail?: string | null, role: AttendeeRole, userId?: Ids["UserId"] | null, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type CreateSecretSantaMutationVariables = Exact<{
  input: CreateSecretSantaInput;
}>;


export type CreateSecretSantaMutation = { __typename?: 'Mutation', createSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'SecretSanta', id: Ids["SecretSantaId"], eventId: Ids["EventId"], description?: string | null, budget?: number | null, status: SecretSantaStatus, createdAt: string, updatedAt: string, users: Array<{ __typename?: 'SecretSantaUser', id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { __typename?: 'EventAttendee', id: Ids["AttendeeId"], pendingEmail?: string | null, role: AttendeeRole, userId?: Ids["UserId"] | null, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null } }> }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type UpdateSecretSantaMutationVariables = Exact<{
  id: Scalars['SecretSantaId']['input'];
  input: UpdateSecretSantaInput;
}>;


export type UpdateSecretSantaMutation = { __typename?: 'Mutation', updateSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteSecretSantaMutationVariables = Exact<{
  id: Scalars['SecretSantaId']['input'];
}>;


export type DeleteSecretSantaMutation = { __typename?: 'Mutation', deleteSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type StartSecretSantaMutationVariables = Exact<{
  id: Scalars['SecretSantaId']['input'];
}>;


export type StartSecretSantaMutation = { __typename?: 'Mutation', startSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type CancelSecretSantaMutationVariables = Exact<{
  id: Scalars['SecretSantaId']['input'];
}>;


export type CancelSecretSantaMutation = { __typename?: 'Mutation', cancelSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AddSecretSantaUsersMutationVariables = Exact<{
  id: Scalars['SecretSantaId']['input'];
  input: AddSecretSantaUsersInput;
}>;


export type AddSecretSantaUsersMutation = { __typename?: 'Mutation', addSecretSantaUsers:
    | { __typename: 'AddSecretSantaUsersOutput', users: Array<{ __typename?: 'SecretSantaUser', id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { __typename?: 'EventAttendee', id: Ids["AttendeeId"], pendingEmail?: string | null, role: AttendeeRole, userId?: Ids["UserId"] | null, user?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null } }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type UpdateSecretSantaUserMutationVariables = Exact<{
  id: Scalars['SecretSantaId']['input'];
  secretSantaUserId: Scalars['SecretSantaUserId']['input'];
  input: UpdateSecretSantaUserInput;
}>;


export type UpdateSecretSantaUserMutation = { __typename?: 'Mutation', updateSecretSantaUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteSecretSantaUserMutationVariables = Exact<{
  id: Scalars['SecretSantaId']['input'];
  secretSantaUserId: Scalars['SecretSantaUserId']['input'];
}>;


export type DeleteSecretSantaUserMutation = { __typename?: 'Mutation', deleteSecretSantaUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminUsersListQueryVariables = Exact<{
  input?: InputMaybe<AdminGetAllUsersPaginationFilters>;
}>;


export type AdminUsersListQuery = { __typename?: 'Query', adminUsers:
    | { __typename: 'AdminGetAllUsers', data: Array<{ __typename?: 'UserFull', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null, isEnabled: boolean, authorities: Array<UserAuthorities>, createdAt: string }>, pagination: { __typename?: 'Pagination', totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type AdminUserDetailQueryVariables = Exact<{
  userId: Scalars['UserId']['input'];
}>;


export type AdminUserDetailQuery = { __typename?: 'Query', adminUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'UserFull', id: Ids["UserId"], firstName: string, lastName: string, email: string, birthday?: string | null, pictureUrl?: string | null, isEnabled: boolean, authorities: Array<UserAuthorities>, createdAt: string, lastConnectedAt?: string | null, lastIp?: string | null }
    | { __typename: 'ValidationRejection' }
   };

export type AdminUpdateUserProfileMutationVariables = Exact<{
  userId: Scalars['UserId']['input'];
  input: AdminUpdateUserProfileInput;
}>;


export type AdminUpdateUserProfileMutation = { __typename?: 'Mutation', adminUpdateUserProfile:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminDeleteUserMutationVariables = Exact<{
  userId: Scalars['UserId']['input'];
}>;


export type AdminDeleteUserMutation = { __typename?: 'Mutation', adminDeleteUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminRemoveUserPictureMutationVariables = Exact<{
  userId: Scalars['UserId']['input'];
}>;


export type AdminRemoveUserPictureMutation = { __typename?: 'Mutation', adminRemoveUserPicture:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UserProfileCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfileCurrentUserQuery = { __typename?: 'Query', currentUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], email: string, firstName: string, lastName: string, birthday?: string | null, pictureUrl?: string | null, createdAt: string, socials?: Array<{ __typename?: 'UserSocial', id: Ids["UserSocialId"], socialType: string, name?: string | null, email: string, pictureUrl?: string | null, createdAt: string, updatedAt: string }> | null }
   };

export type UserProfileEmailSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfileEmailSettingsQuery = { __typename?: 'Query', currentUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], emailSettings?: { __typename?: 'UserEmailSettings', dailyNewItemNotification: boolean } | null }
   };

export type UserPendingEmailChangeQueryVariables = Exact<{ [key: string]: never; }>;


export type UserPendingEmailChangeQuery = { __typename?: 'Query', pendingEmailChange?:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'PendingEmailChange', newEmail: string, expiredAt: string }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type SearchUsersSelectQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;


export type SearchUsersSelectQuery = { __typename?: 'Query', searchUsers:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'SearchUsersOutput', users: Array<{ __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null }> }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type UserClosestFriendsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UserClosestFriendsQuery = { __typename?: 'Query', closestFriends:
    | { __typename: 'ClosestFriendsOutput', users: Array<{ __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;


export type UpdateUserProfileMutation = { __typename?: 'Mutation', updateUserProfile:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], firstName: string, lastName: string, birthday?: string | null }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type ChangeUserPasswordMutationVariables = Exact<{
  input: ChangeUserPasswordInput;
}>;


export type ChangeUserPasswordMutation = { __typename?: 'Mutation', changeUserPassword:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UpdateUserEmailSettingsMutationVariables = Exact<{
  input: UpdateUserEmailSettingsInput;
}>;


export type UpdateUserEmailSettingsMutation = { __typename?: 'Mutation', updateUserEmailSettings:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'UserEmailSettings', dailyNewItemNotification: boolean }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type LinkCurrentUserWithGoogleMutationVariables = Exact<{
  input: LinkUserToGoogleInput;
}>;


export type LinkCurrentUserWithGoogleMutation = { __typename?: 'Mutation', linkCurrentUserWithGoogle:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'UserSocial', id: Ids["UserSocialId"], socialType: string, name?: string | null, email: string, pictureUrl?: string | null, createdAt: string, updatedAt: string }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
   };

export type UnlinkCurrentUserSocialMutationVariables = Exact<{
  socialId: Scalars['UserSocialId']['input'];
}>;


export type UnlinkCurrentUserSocialMutation = { __typename?: 'Mutation', unlinkCurrentUserSocial:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UpdateUserPictureFromSocialMutationVariables = Exact<{
  input: UpdateUserPictureFromSocialInput;
}>;


export type UpdateUserPictureFromSocialMutation = { __typename?: 'Mutation', updateUserPictureFromSocial:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RemoveCurrentUserPictureMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveCurrentUserPictureMutation = { __typename?: 'Mutation', removeUserPicture:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RequestUserEmailChangeMutationVariables = Exact<{
  input: RequestEmailChangeInput;
}>;


export type RequestUserEmailChangeMutation = { __typename?: 'Mutation', requestEmailChange:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type WishlistListPageQueryVariables = Exact<{
  filters: PaginationFilters;
}>;


export type WishlistListPageQuery = { __typename?: 'Query', wishlists:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetWishlistsPagedResponse', data: Array<{ __typename?: 'Wishlist', id: Ids["WishlistId"], title: string, description?: string | null, logoUrl?: string | null, config: { __typename?: 'WishlistConfig', hideItems: boolean }, events: Array<{ __typename?: 'Event', id: Ids["EventId"], title: string, icon?: string | null, eventDate: string }> }>, pagination: { __typename?: 'Pagination', totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
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

export type LinkWishlistToEventMutationVariables = Exact<{
  id: Scalars['WishlistId']['input'];
  eventId: Scalars['EventId']['input'];
}>;


export type LinkWishlistToEventMutation = { __typename?: 'Mutation', linkWishlistToEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UnlinkWishlistFromEventMutationVariables = Exact<{
  id: Scalars['WishlistId']['input'];
  eventId: Scalars['EventId']['input'];
}>;


export type UnlinkWishlistFromEventMutation = { __typename?: 'Mutation', unlinkWishlistFromEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AddWishlistCoOwnerMutationVariables = Exact<{
  id: Scalars['WishlistId']['input'];
  input: AddWishlistCoOwnerInput;
}>;


export type AddWishlistCoOwnerMutation = { __typename?: 'Mutation', addWishlistCoOwner:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ __typename?: 'FieldError', field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RemoveWishlistCoOwnerMutationVariables = Exact<{
  id: Scalars['WishlistId']['input'];
}>;


export type RemoveWishlistCoOwnerMutation = { __typename?: 'Mutation', removeWishlistCoOwner:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RemoveWishlistLogoMutationVariables = Exact<{
  id: Scalars['WishlistId']['input'];
}>;


export type RemoveWishlistLogoMutation = { __typename?: 'Mutation', removeWishlistLogo:
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
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'Wishlist', id: Ids["WishlistId"], title: string, description?: string | null, logoUrl?: string | null, ownerId: Ids["UserId"], coOwnerId?: Ids["UserId"] | null, createdAt: string, updatedAt: string, config: { __typename?: 'WishlistConfig', hideItems: boolean }, owner: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null }, coOwner?: { __typename?: 'User', id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl?: string | null } | null, events: Array<{ __typename?: 'Event', id: Ids["EventId"], title: string, icon?: string | null, eventDate: string }>, items: Array<{ __typename?: 'Item', id: Ids["ItemId"], name: string, description?: string | null, url?: string | null, score?: number | null, isSuggested?: boolean | null, pictureUrl?: string | null, takenById?: Ids["UserId"] | null, takenAt?: string | null, createdAt: string, takerUser?: { __typename?: 'User', id: Ids["UserId"], firstName: string, pictureUrl?: string | null } | null }> }
   | null };

export type AdminListWishlistsForUserQueryVariables = Exact<{
  filters: AdminWishlistPaginationFilters;
}>;


export type AdminListWishlistsForUserQuery = { __typename?: 'Query', adminWishlists:
    | { __typename: 'AdminGetWishlists', data: Array<{ __typename?: 'Wishlist', id: Ids["WishlistId"], title: string, logoUrl?: string | null, coOwnerId?: Ids["UserId"] | null, createdAt: string, config: { __typename?: 'WishlistConfig', hideItems: boolean }, events: Array<{ __typename?: 'Event', id: Ids["EventId"], title: string }> }>, pagination: { __typename?: 'Pagination', totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };
