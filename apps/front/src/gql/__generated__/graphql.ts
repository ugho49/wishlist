/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { Ids } from '@wishlist/common'
import type * as Types from './types';

import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { fetchGql } from '../fetcher';
export type AuthLoginMutationVariables = Exact<{
  input: Types.LoginInput;
}>;


export type AuthLoginMutation = { login:
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'LoginOutput', accessToken: string }
    | { __typename: 'UnauthorizedRejection', message: string }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type AuthLoginWithGoogleMutationVariables = Exact<{
  input: Types.LoginWithGoogleInput;
}>;


export type AuthLoginWithGoogleMutation = { loginWithGoogle:
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'LoginWithGoogleOutput', accessToken: string, newUserCreated: boolean | null, linkedToExistingUser: boolean | null }
    | { __typename: 'UnauthorizedRejection', message: string }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type AuthRegisterUserMutationVariables = Exact<{
  input: Types.RegisterUserInput;
}>;


export type AuthRegisterUserMutation = { registerUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], email: string }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type AuthSendResetPasswordEmailMutationVariables = Exact<{
  input: Types.SendResetPasswordEmailInput;
}>;


export type AuthSendResetPasswordEmailMutation = { sendResetPasswordEmail:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AuthResetPasswordMutationVariables = Exact<{
  input: Types.ResetPasswordInput;
}>;


export type AuthResetPasswordMutation = { resetPassword:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AuthConfirmEmailChangeMutationVariables = Exact<{
  input: Types.ConfirmEmailChangeInput;
}>;


export type AuthConfirmEmailChangeMutation = { confirmEmailChange:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type EventListPageGetEventsQueryVariables = Exact<{
  filters: Types.EventPaginationFilters;
}>;


export type EventListPageGetEventsQuery = { events:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetEventsPagedResponse', data: Array<{ id: Ids["EventId"], title: string, icon: string | null, eventDate: string, attendeeIds: Array<Ids["AttendeeId"]>, wishlistIds: Array<Ids["WishlistId"]> }>, pagination: { totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   };

export type CreateEventMutationVariables = Exact<{
  input: Types.CreateEventInput;
}>;


export type CreateEventMutation = { createEvent:
    | { __typename: 'Event', id: Ids["EventId"] }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type UpdateEventMutationVariables = Exact<{
  id: Ids["EventId"];
  input: Types.UpdateEventInput;
}>;


export type UpdateEventMutation = { updateEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteEventMutationVariables = Exact<{
  id: Ids["EventId"];
}>;


export type DeleteEventMutation = { deleteEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AddEventAttendeeMutationVariables = Exact<{
  eventId: Ids["EventId"];
  input: Types.AddEventAttendeeInput;
}>;


export type AddEventAttendeeMutation = { addEventAttendee:
    | { __typename: 'EventAttendee', id: Ids["AttendeeId"], userId: Ids["UserId"] | null, pendingEmail: string | null, role: Types.AttendeeRole, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type RemoveEventAttendeeMutationVariables = Exact<{
  eventId: Ids["EventId"];
  attendeeId: Ids["AttendeeId"];
}>;


export type RemoveEventAttendeeMutation = { removeEventAttendee:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UpdateEventAttendeeRoleMutationVariables = Exact<{
  eventId: Ids["EventId"];
  attendeeId: Ids["AttendeeId"];
  role: Types.AttendeeRole;
}>;


export type UpdateEventAttendeeRoleMutation = { updateEventAttendeeRole:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type EventPageGetEventQueryVariables = Exact<{
  eventId: Ids["EventId"];
}>;


export type EventPageGetEventQuery = { event:
    | { __typename: 'Event', id: Ids["EventId"], title: string, description: string | null, icon: string | null, eventDate: string, attendees: Array<{ id: Ids["AttendeeId"], userId: Ids["UserId"] | null, pendingEmail: string | null, role: Types.AttendeeRole, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null }>, wishlists: Array<{ id: Ids["WishlistId"], title: string, logoUrl: string | null, config: { hideItems: boolean }, owner: { id: Ids["UserId"], firstName: string, lastName: string, pictureUrl: string | null } }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection', message: string }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type EventSelectAvailableEventsQueryVariables = Exact<{
  filters: Types.EventPaginationFilters;
}>;


export type EventSelectAvailableEventsQuery = { events:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetEventsPagedResponse', data: Array<{ id: Ids["EventId"], title: string, icon: string | null, eventDate: string }> }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   };

export type AdminEventListEventsQueryVariables = Exact<{
  filters: Types.AdminEventPaginationFilters;
}>;


export type AdminEventListEventsQuery = { adminEvents:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetEventsPagedResponse', data: Array<{ id: Ids["EventId"], title: string, icon: string | null, eventDate: string, wishlistIds: Array<Ids["WishlistId"]>, createdAt: string, attendees: Array<{ id: Ids["AttendeeId"], role: Types.AttendeeRole, user: { id: Ids["UserId"], firstName: string, lastName: string } | null }> }>, pagination: { totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type AdminEventGetEventQueryVariables = Exact<{
  id: Ids["EventId"];
}>;


export type AdminEventGetEventQuery = { adminEvent:
    | { __typename: 'Event', id: Ids["EventId"], title: string, description: string | null, icon: string | null, eventDate: string, createdAt: string, attendees: Array<{ id: Ids["AttendeeId"], userId: Ids["UserId"] | null, pendingEmail: string | null, role: Types.AttendeeRole, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null }>, wishlists: Array<{ id: Ids["WishlistId"], title: string, logoUrl: string | null, createdAt: string, config: { hideItems: boolean }, owner: { id: Ids["UserId"], firstName: string, lastName: string, pictureUrl: string | null }, coOwner: { id: Ids["UserId"], firstName: string, lastName: string } | null }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type AdminUpdateEventMutationVariables = Exact<{
  id: Ids["EventId"];
  input: Types.UpdateEventInput;
}>;


export type AdminUpdateEventMutation = { adminUpdateEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminDeleteEventMutationVariables = Exact<{
  id: Ids["EventId"];
}>;


export type AdminDeleteEventMutation = { adminDeleteEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminDeleteEventAttendeeMutationVariables = Exact<{
  eventId: Ids["EventId"];
  attendeeId: Ids["AttendeeId"];
}>;


export type AdminDeleteEventAttendeeMutation = { adminDeleteEventAttendee:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type ImportableItemsQueryVariables = Exact<{
  wishlistId: Ids["WishlistId"];
}>;


export type ImportableItemsQuery = { importableItems:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetImportableItemsOutput', items: Array<{ id: Ids["ItemId"], name: string, description: string | null, url: string | null, score: number | null, isSuggested: boolean | null, pictureUrl: string | null, createdAt: string, takers: Array<{ userId: Ids["UserId"], takenAt: string, user: { id: Ids["UserId"], firstName: string, lastName: string, pictureUrl: string | null } }> }> }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   };

export type CreateItemMutationVariables = Exact<{
  input: Types.CreateItemInput;
}>;


export type CreateItemMutation = { createItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'Item', id: Ids["ItemId"], name: string, description: string | null, url: string | null, score: number | null, isSuggested: boolean | null, pictureUrl: string | null, createdAt: string, takers: Array<{ userId: Ids["UserId"], takenAt: string, user: { id: Ids["UserId"], firstName: string, lastName: string, pictureUrl: string | null } }> }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type UpdateItemMutationVariables = Exact<{
  itemId: Ids["ItemId"];
  input: Types.UpdateItemInput;
}>;


export type UpdateItemMutation = { updateItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteItemMutationVariables = Exact<{
  itemId: Ids["ItemId"];
}>;


export type DeleteItemMutation = { deleteItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type ToggleItemMutationVariables = Exact<{
  itemId: Ids["ItemId"];
}>;


export type ToggleItemMutation = { toggleItem:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'ToggleItemOutput', takers: Array<{ userId: Ids["UserId"], takenAt: string, user: { id: Ids["UserId"], firstName: string, lastName: string, pictureUrl: string | null } }> }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type ScanItemUrlMutationVariables = Exact<{
  input: Types.ScanItemUrlInput;
}>;


export type ScanItemUrlMutation = { scanItemUrl:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'ScanItemUrlOutput', pictureUrl: string | null }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type ImportItemsMutationVariables = Exact<{
  input: Types.ImportItemsInput;
}>;


export type ImportItemsMutation = { importItems:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'ImportItemsOutput', items: Array<{ id: Ids["ItemId"], name: string, description: string | null, url: string | null, score: number | null, isSuggested: boolean | null, pictureUrl: string | null, createdAt: string, takers: Array<{ userId: Ids["UserId"], takenAt: string, user: { id: Ids["UserId"], firstName: string, lastName: string, pictureUrl: string | null } }> }> }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type SecretSantaUserItemFragment = { id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { id: Ids["AttendeeId"], pendingEmail: string | null, role: Types.AttendeeRole, userId: Ids["UserId"] | null, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null } };

export type SecretSantaItemFragment = { id: Ids["SecretSantaId"], eventId: Ids["EventId"], description: string | null, budget: number | null, status: Types.SecretSantaStatus, createdAt: string, updatedAt: string, users: Array<{ id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { id: Ids["AttendeeId"], pendingEmail: string | null, role: Types.AttendeeRole, userId: Ids["UserId"] | null, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null } }> };

export type GetSecretSantaForEventQueryVariables = Exact<{
  eventId: Ids["EventId"];
}>;


export type GetSecretSantaForEventQuery = { secretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'SecretSanta', id: Ids["SecretSantaId"], eventId: Ids["EventId"], description: string | null, budget: number | null, status: Types.SecretSantaStatus, createdAt: string, updatedAt: string, users: Array<{ id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { id: Ids["AttendeeId"], pendingEmail: string | null, role: Types.AttendeeRole, userId: Ids["UserId"] | null, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null } }> }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type GetMySecretSantaDrawQueryVariables = Exact<{
  eventId: Ids["EventId"];
}>;


export type GetMySecretSantaDrawQuery = { mySecretSantaDraw:
    | { __typename: 'EventAttendee', id: Ids["AttendeeId"], pendingEmail: string | null, role: Types.AttendeeRole, userId: Ids["UserId"] | null, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type CreateSecretSantaMutationVariables = Exact<{
  input: Types.CreateSecretSantaInput;
}>;


export type CreateSecretSantaMutation = { createSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'SecretSanta', id: Ids["SecretSantaId"], eventId: Ids["EventId"], description: string | null, budget: number | null, status: Types.SecretSantaStatus, createdAt: string, updatedAt: string, users: Array<{ id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { id: Ids["AttendeeId"], pendingEmail: string | null, role: Types.AttendeeRole, userId: Ids["UserId"] | null, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null } }> }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type UpdateSecretSantaMutationVariables = Exact<{
  id: Ids["SecretSantaId"];
  input: Types.UpdateSecretSantaInput;
}>;


export type UpdateSecretSantaMutation = { updateSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteSecretSantaMutationVariables = Exact<{
  id: Ids["SecretSantaId"];
}>;


export type DeleteSecretSantaMutation = { deleteSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type StartSecretSantaMutationVariables = Exact<{
  id: Ids["SecretSantaId"];
}>;


export type StartSecretSantaMutation = { startSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type CancelSecretSantaMutationVariables = Exact<{
  id: Ids["SecretSantaId"];
}>;


export type CancelSecretSantaMutation = { cancelSecretSanta:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AddSecretSantaUsersMutationVariables = Exact<{
  id: Ids["SecretSantaId"];
  input: Types.AddSecretSantaUsersInput;
}>;


export type AddSecretSantaUsersMutation = { addSecretSantaUsers:
    | { __typename: 'AddSecretSantaUsersOutput', users: Array<{ id: Ids["SecretSantaUserId"], attendeeId: Ids["AttendeeId"], exclusions: Array<Ids["SecretSantaUserId"]>, attendee: { id: Ids["AttendeeId"], pendingEmail: string | null, role: Types.AttendeeRole, userId: Ids["UserId"] | null, user: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null } }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type UpdateSecretSantaUserMutationVariables = Exact<{
  id: Ids["SecretSantaId"];
  secretSantaUserId: Ids["SecretSantaUserId"];
  input: Types.UpdateSecretSantaUserInput;
}>;


export type UpdateSecretSantaUserMutation = { updateSecretSantaUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteSecretSantaUserMutationVariables = Exact<{
  id: Ids["SecretSantaId"];
  secretSantaUserId: Ids["SecretSantaUserId"];
}>;


export type DeleteSecretSantaUserMutation = { deleteSecretSantaUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminUsersListQueryVariables = Exact<{
  input?: Types.AdminGetAllUsersPaginationFilters | null | undefined;
}>;


export type AdminUsersListQuery = { adminUsers:
    | { __typename: 'AdminGetAllUsers', data: Array<{ id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null, isEnabled: boolean, authorities: Array<Types.UserAuthorities>, createdAt: string }>, pagination: { totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type AdminUserDetailQueryVariables = Exact<{
  userId: Ids["UserId"];
}>;


export type AdminUserDetailQuery = { adminUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'UserFull', id: Ids["UserId"], firstName: string, lastName: string, email: string, birthday: string | null, pictureUrl: string | null, isEnabled: boolean, authorities: Array<Types.UserAuthorities>, createdAt: string, lastConnectedAt: string | null, lastIp: string | null, accounts: Array<{ id: Ids["UserAccountId"], provider: Types.UserAccountProvider, email: string, pictureUrl: string | null, createdAt: string }> }
    | { __typename: 'ValidationRejection' }
   };

export type AdminUpdateUserProfileMutationVariables = Exact<{
  userId: Ids["UserId"];
  input: Types.AdminUpdateUserProfileInput;
}>;


export type AdminUpdateUserProfileMutation = { adminUpdateUserProfile:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminDeleteUserMutationVariables = Exact<{
  userId: Ids["UserId"];
}>;


export type AdminDeleteUserMutation = { adminDeleteUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AdminRemoveUserPictureMutationVariables = Exact<{
  userId: Ids["UserId"];
}>;


export type AdminRemoveUserPictureMutation = { adminRemoveUserPicture:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UserProfileCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfileCurrentUserQuery = { currentUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], email: string, firstName: string, lastName: string, birthday: string | null, pictureUrl: string | null, createdAt: string, accounts: Array<{ id: Ids["UserAccountId"], provider: Types.UserAccountProvider, email: string, pictureUrl: string | null, createdAt: string, updatedAt: string }> | null }
   };

export type UserProfileEmailSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfileEmailSettingsQuery = { currentUser:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], emailSettings: { dailyNewItemNotification: boolean } | null }
   };

export type UserPendingEmailChangeQueryVariables = Exact<{ [key: string]: never; }>;


export type UserPendingEmailChangeQuery = { pendingEmailChange:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'PendingEmailChange', newEmail: string, expiredAt: string }
    | { __typename: 'UnauthorizedRejection' }
   | null };

export type SearchUsersSelectQueryVariables = Exact<{
  keyword: string;
}>;


export type SearchUsersSelectQuery = { searchUsers:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'SearchUsersOutput', users: Array<{ id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null }> }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type UserClosestFriendsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type UserClosestFriendsQuery = { closestFriends:
    | { __typename: 'ClosestFriendsOutput', users: Array<{ id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null }> }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };

export type UpdateUserProfileMutationVariables = Exact<{
  input: Types.UpdateUserProfileInput;
}>;


export type UpdateUserProfileMutation = { updateUserProfile:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'User', id: Ids["UserId"], firstName: string, lastName: string, birthday: string | null }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type ChangeUserPasswordMutationVariables = Exact<{
  input: Types.ChangeUserPasswordInput;
}>;


export type ChangeUserPasswordMutation = { changeUserPassword:
    | { __typename: 'BusinessRuleRejection', code: Types.BusinessRuleCode, message: string }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UpdateUserEmailSettingsMutationVariables = Exact<{
  input: Types.UpdateUserEmailSettingsInput;
}>;


export type UpdateUserEmailSettingsMutation = { updateUserEmailSettings:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'UserEmailSettings', dailyNewItemNotification: boolean }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type LinkCurrentUserWithGoogleMutationVariables = Exact<{
  input: Types.LinkUserToGoogleInput;
}>;


export type LinkCurrentUserWithGoogleMutation = { linkCurrentUserWithGoogle:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'UserAccount', id: Ids["UserAccountId"], provider: Types.UserAccountProvider, email: string, pictureUrl: string | null, createdAt: string, updatedAt: string }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
   };

export type UnlinkCurrentUserAccountMutationVariables = Exact<{
  accountId: Ids["UserAccountId"];
}>;


export type UnlinkCurrentUserAccountMutation = { unlinkCurrentUserAccount:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UpdateUserPictureFromAccountMutationVariables = Exact<{
  input: Types.UpdateUserPictureFromAccountInput;
}>;


export type UpdateUserPictureFromAccountMutation = { updateUserPictureFromAccount:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RemoveCurrentUserPictureMutationVariables = Exact<{ [key: string]: never; }>;


export type RemoveCurrentUserPictureMutation = { removeUserPicture:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RequestUserEmailChangeMutationVariables = Exact<{
  input: Types.RequestEmailChangeInput;
}>;


export type RequestUserEmailChangeMutation = { requestEmailChange:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type WishlistListPageQueryVariables = Exact<{
  filters: Types.PaginationFilters;
}>;


export type WishlistListPageQuery = { wishlists:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'GetWishlistsPagedResponse', data: Array<{ id: Ids["WishlistId"], title: string, description: string | null, logoUrl: string | null, config: { hideItems: boolean }, events: Array<{ id: Ids["EventId"], title: string, icon: string | null, eventDate: string }> }>, pagination: { totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
   };

export type UpdateWishlistMutationVariables = Exact<{
  id: Ids["WishlistId"];
  input: Types.UpdateWishlistInput;
}>;


export type UpdateWishlistMutation = { updateWishlist:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type DeleteWishlistMutationVariables = Exact<{
  id: Ids["WishlistId"];
}>;


export type DeleteWishlistMutation = { deleteWishlist:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type LinkWishlistToEventMutationVariables = Exact<{
  id: Ids["WishlistId"];
  eventId: Ids["EventId"];
}>;


export type LinkWishlistToEventMutation = { linkWishlistToEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type UnlinkWishlistFromEventMutationVariables = Exact<{
  id: Ids["WishlistId"];
  eventId: Ids["EventId"];
}>;


export type UnlinkWishlistFromEventMutation = { unlinkWishlistFromEvent:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type AddWishlistCoOwnerMutationVariables = Exact<{
  id: Ids["WishlistId"];
  input: Types.AddWishlistCoOwnerInput;
}>;


export type AddWishlistCoOwnerMutation = { addWishlistCoOwner:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection', errors: Array<{ field: string, message: string }> }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RemoveWishlistCoOwnerMutationVariables = Exact<{
  id: Ids["WishlistId"];
}>;


export type RemoveWishlistCoOwnerMutation = { removeWishlistCoOwner:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type RemoveWishlistLogoMutationVariables = Exact<{
  id: Ids["WishlistId"];
}>;


export type RemoveWishlistLogoMutation = { removeWishlistLogo:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
    | { __typename: 'VoidOutput', success: boolean }
   };

export type WishlistPageQueryVariables = Exact<{
  wishlistId: Ids["WishlistId"];
}>;


export type WishlistPageQuery = { wishlist:
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'NotFoundRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'Wishlist', id: Ids["WishlistId"], title: string, description: string | null, logoUrl: string | null, ownerId: Ids["UserId"], coOwnerId: Ids["UserId"] | null, createdAt: string, updatedAt: string, config: { hideItems: boolean }, owner: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null }, coOwner: { id: Ids["UserId"], firstName: string, lastName: string, email: string, pictureUrl: string | null } | null, events: Array<{ id: Ids["EventId"], title: string, icon: string | null, eventDate: string }>, items: Array<{ id: Ids["ItemId"], name: string, description: string | null, url: string | null, score: number | null, isSuggested: boolean | null, pictureUrl: string | null, createdAt: string, takers: Array<{ userId: Ids["UserId"], takenAt: string, user: { id: Ids["UserId"], firstName: string, lastName: string, pictureUrl: string | null } }> }> }
   | null };

export type AdminListWishlistsForUserQueryVariables = Exact<{
  filters: Types.AdminWishlistPaginationFilters;
}>;


export type AdminListWishlistsForUserQuery = { adminWishlists:
    | { __typename: 'AdminGetWishlists', data: Array<{ id: Ids["WishlistId"], title: string, logoUrl: string | null, coOwnerId: Ids["UserId"] | null, createdAt: string, config: { hideItems: boolean }, events: Array<{ id: Ids["EventId"], title: string }> }>, pagination: { totalPages: number, totalElements: number, pageNumber: number, pageSize: number } }
    | { __typename: 'ForbiddenRejection' }
    | { __typename: 'InternalErrorRejection' }
    | { __typename: 'UnauthorizedRejection' }
    | { __typename: 'ValidationRejection' }
   };


export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const SecretSantaUserItemFragmentDoc = new TypedDocumentString(`
    fragment SecretSantaUserItem on SecretSantaUser {
  id
  attendeeId
  exclusions
  attendee {
    id
    pendingEmail
    role
    userId
    user {
      id
      firstName
      lastName
      email
      pictureUrl
    }
  }
}
    `, {"fragmentName":"SecretSantaUserItem"});
export const SecretSantaItemFragmentDoc = new TypedDocumentString(`
    fragment SecretSantaItem on SecretSanta {
  id
  eventId
  description
  budget
  status
  createdAt
  updatedAt
  users {
    ...SecretSantaUserItem
  }
}
    fragment SecretSantaUserItem on SecretSantaUser {
  id
  attendeeId
  exclusions
  attendee {
    id
    pendingEmail
    role
    userId
    user {
      id
      firstName
      lastName
      email
      pictureUrl
    }
  }
}`, {"fragmentName":"SecretSantaItem"});
export const AuthLoginDocument = new TypedDocumentString(`
    mutation AuthLogin($input: LoginInput!) {
  login(input: $input) {
    __typename
    ... on LoginOutput {
      accessToken
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
    ... on UnauthorizedRejection {
      message
    }
  }
}
    `);

export const useAuthLoginMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AuthLoginMutation, TError, AuthLoginMutationVariables, TContext>) => {
    
    return useMutation<AuthLoginMutation, TError, AuthLoginMutationVariables, TContext>(
      {
    mutationKey: ['AuthLogin'],
    mutationFn: (variables?: AuthLoginMutationVariables) => fetchGql<AuthLoginMutation, AuthLoginMutationVariables>(AuthLoginDocument, variables)(),
    ...options
  }
    )};

export const AuthLoginWithGoogleDocument = new TypedDocumentString(`
    mutation AuthLoginWithGoogle($input: LoginWithGoogleInput!) {
  loginWithGoogle(input: $input) {
    __typename
    ... on LoginWithGoogleOutput {
      accessToken
      newUserCreated
      linkedToExistingUser
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
    ... on UnauthorizedRejection {
      message
    }
  }
}
    `);

export const useAuthLoginWithGoogleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AuthLoginWithGoogleMutation, TError, AuthLoginWithGoogleMutationVariables, TContext>) => {
    
    return useMutation<AuthLoginWithGoogleMutation, TError, AuthLoginWithGoogleMutationVariables, TContext>(
      {
    mutationKey: ['AuthLoginWithGoogle'],
    mutationFn: (variables?: AuthLoginWithGoogleMutationVariables) => fetchGql<AuthLoginWithGoogleMutation, AuthLoginWithGoogleMutationVariables>(AuthLoginWithGoogleDocument, variables)(),
    ...options
  }
    )};

export const AuthRegisterUserDocument = new TypedDocumentString(`
    mutation AuthRegisterUser($input: RegisterUserInput!) {
  registerUser(input: $input) {
    __typename
    ... on User {
      id
      email
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAuthRegisterUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AuthRegisterUserMutation, TError, AuthRegisterUserMutationVariables, TContext>) => {
    
    return useMutation<AuthRegisterUserMutation, TError, AuthRegisterUserMutationVariables, TContext>(
      {
    mutationKey: ['AuthRegisterUser'],
    mutationFn: (variables?: AuthRegisterUserMutationVariables) => fetchGql<AuthRegisterUserMutation, AuthRegisterUserMutationVariables>(AuthRegisterUserDocument, variables)(),
    ...options
  }
    )};

export const AuthSendResetPasswordEmailDocument = new TypedDocumentString(`
    mutation AuthSendResetPasswordEmail($input: SendResetPasswordEmailInput!) {
  sendResetPasswordEmail(input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAuthSendResetPasswordEmailMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AuthSendResetPasswordEmailMutation, TError, AuthSendResetPasswordEmailMutationVariables, TContext>) => {
    
    return useMutation<AuthSendResetPasswordEmailMutation, TError, AuthSendResetPasswordEmailMutationVariables, TContext>(
      {
    mutationKey: ['AuthSendResetPasswordEmail'],
    mutationFn: (variables?: AuthSendResetPasswordEmailMutationVariables) => fetchGql<AuthSendResetPasswordEmailMutation, AuthSendResetPasswordEmailMutationVariables>(AuthSendResetPasswordEmailDocument, variables)(),
    ...options
  }
    )};

export const AuthResetPasswordDocument = new TypedDocumentString(`
    mutation AuthResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAuthResetPasswordMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AuthResetPasswordMutation, TError, AuthResetPasswordMutationVariables, TContext>) => {
    
    return useMutation<AuthResetPasswordMutation, TError, AuthResetPasswordMutationVariables, TContext>(
      {
    mutationKey: ['AuthResetPassword'],
    mutationFn: (variables?: AuthResetPasswordMutationVariables) => fetchGql<AuthResetPasswordMutation, AuthResetPasswordMutationVariables>(AuthResetPasswordDocument, variables)(),
    ...options
  }
    )};

export const AuthConfirmEmailChangeDocument = new TypedDocumentString(`
    mutation AuthConfirmEmailChange($input: ConfirmEmailChangeInput!) {
  confirmEmailChange(input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAuthConfirmEmailChangeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AuthConfirmEmailChangeMutation, TError, AuthConfirmEmailChangeMutationVariables, TContext>) => {
    
    return useMutation<AuthConfirmEmailChangeMutation, TError, AuthConfirmEmailChangeMutationVariables, TContext>(
      {
    mutationKey: ['AuthConfirmEmailChange'],
    mutationFn: (variables?: AuthConfirmEmailChangeMutationVariables) => fetchGql<AuthConfirmEmailChangeMutation, AuthConfirmEmailChangeMutationVariables>(AuthConfirmEmailChangeDocument, variables)(),
    ...options
  }
    )};

export const EventListPageGetEventsDocument = new TypedDocumentString(`
    query EventListPageGetEvents($filters: EventPaginationFilters!) {
  events(filters: $filters) {
    __typename
    ... on GetEventsPagedResponse {
      data {
        id
        title
        icon
        eventDate
        attendeeIds
        wishlistIds
      }
      pagination {
        totalPages
        totalElements
        pageNumber
        pageSize
      }
    }
  }
}
    `);

export const useEventListPageGetEventsQuery = <
      TData = EventListPageGetEventsQuery,
      TError = unknown
    >(
      variables: EventListPageGetEventsQueryVariables,
      options?: Omit<UseQueryOptions<EventListPageGetEventsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<EventListPageGetEventsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<EventListPageGetEventsQuery, TError, TData>(
      {
    queryKey: ['EventListPageGetEvents', variables],
    queryFn: fetchGql<EventListPageGetEventsQuery, EventListPageGetEventsQueryVariables>(EventListPageGetEventsDocument, variables),
    ...options
  }
    )};

export const CreateEventDocument = new TypedDocumentString(`
    mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    __typename
    ... on Event {
      id
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useCreateEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateEventMutation, TError, CreateEventMutationVariables, TContext>) => {
    
    return useMutation<CreateEventMutation, TError, CreateEventMutationVariables, TContext>(
      {
    mutationKey: ['CreateEvent'],
    mutationFn: (variables?: CreateEventMutationVariables) => fetchGql<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument, variables)(),
    ...options
  }
    )};

export const UpdateEventDocument = new TypedDocumentString(`
    mutation UpdateEvent($id: EventId!, $input: UpdateEventInput!) {
  updateEvent(id: $id, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUpdateEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateEventMutation, TError, UpdateEventMutationVariables, TContext>) => {
    
    return useMutation<UpdateEventMutation, TError, UpdateEventMutationVariables, TContext>(
      {
    mutationKey: ['UpdateEvent'],
    mutationFn: (variables?: UpdateEventMutationVariables) => fetchGql<UpdateEventMutation, UpdateEventMutationVariables>(UpdateEventDocument, variables)(),
    ...options
  }
    )};

export const DeleteEventDocument = new TypedDocumentString(`
    mutation DeleteEvent($id: EventId!) {
  deleteEvent(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useDeleteEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteEventMutation, TError, DeleteEventMutationVariables, TContext>) => {
    
    return useMutation<DeleteEventMutation, TError, DeleteEventMutationVariables, TContext>(
      {
    mutationKey: ['DeleteEvent'],
    mutationFn: (variables?: DeleteEventMutationVariables) => fetchGql<DeleteEventMutation, DeleteEventMutationVariables>(DeleteEventDocument, variables)(),
    ...options
  }
    )};

export const AddEventAttendeeDocument = new TypedDocumentString(`
    mutation AddEventAttendee($eventId: EventId!, $input: AddEventAttendeeInput!) {
  addEventAttendee(eventId: $eventId, input: $input) {
    __typename
    ... on EventAttendee {
      id
      userId
      pendingEmail
      role
      user {
        id
        firstName
        lastName
        email
        pictureUrl
      }
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAddEventAttendeeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AddEventAttendeeMutation, TError, AddEventAttendeeMutationVariables, TContext>) => {
    
    return useMutation<AddEventAttendeeMutation, TError, AddEventAttendeeMutationVariables, TContext>(
      {
    mutationKey: ['AddEventAttendee'],
    mutationFn: (variables?: AddEventAttendeeMutationVariables) => fetchGql<AddEventAttendeeMutation, AddEventAttendeeMutationVariables>(AddEventAttendeeDocument, variables)(),
    ...options
  }
    )};

export const RemoveEventAttendeeDocument = new TypedDocumentString(`
    mutation RemoveEventAttendee($eventId: EventId!, $attendeeId: AttendeeId!) {
  removeEventAttendee(eventId: $eventId, attendeeId: $attendeeId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useRemoveEventAttendeeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveEventAttendeeMutation, TError, RemoveEventAttendeeMutationVariables, TContext>) => {
    
    return useMutation<RemoveEventAttendeeMutation, TError, RemoveEventAttendeeMutationVariables, TContext>(
      {
    mutationKey: ['RemoveEventAttendee'],
    mutationFn: (variables?: RemoveEventAttendeeMutationVariables) => fetchGql<RemoveEventAttendeeMutation, RemoveEventAttendeeMutationVariables>(RemoveEventAttendeeDocument, variables)(),
    ...options
  }
    )};

export const UpdateEventAttendeeRoleDocument = new TypedDocumentString(`
    mutation UpdateEventAttendeeRole($eventId: EventId!, $attendeeId: AttendeeId!, $role: AttendeeRole!) {
  updateEventAttendeeRole(eventId: $eventId, attendeeId: $attendeeId, role: $role) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useUpdateEventAttendeeRoleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateEventAttendeeRoleMutation, TError, UpdateEventAttendeeRoleMutationVariables, TContext>) => {
    
    return useMutation<UpdateEventAttendeeRoleMutation, TError, UpdateEventAttendeeRoleMutationVariables, TContext>(
      {
    mutationKey: ['UpdateEventAttendeeRole'],
    mutationFn: (variables?: UpdateEventAttendeeRoleMutationVariables) => fetchGql<UpdateEventAttendeeRoleMutation, UpdateEventAttendeeRoleMutationVariables>(UpdateEventAttendeeRoleDocument, variables)(),
    ...options
  }
    )};

export const EventPageGetEventDocument = new TypedDocumentString(`
    query EventPageGetEvent($eventId: EventId!) {
  event(id: $eventId) {
    __typename
    ... on Event {
      id
      title
      description
      icon
      eventDate
      attendees {
        id
        userId
        pendingEmail
        role
        user {
          id
          firstName
          lastName
          email
          pictureUrl
        }
      }
      wishlists {
        id
        title
        logoUrl
        config {
          hideItems
        }
        owner {
          id
          firstName
          lastName
          pictureUrl
        }
      }
    }
    ... on NotFoundRejection {
      message
    }
  }
}
    `);

export const useEventPageGetEventQuery = <
      TData = EventPageGetEventQuery,
      TError = unknown
    >(
      variables: EventPageGetEventQueryVariables,
      options?: Omit<UseQueryOptions<EventPageGetEventQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<EventPageGetEventQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<EventPageGetEventQuery, TError, TData>(
      {
    queryKey: ['EventPageGetEvent', variables],
    queryFn: fetchGql<EventPageGetEventQuery, EventPageGetEventQueryVariables>(EventPageGetEventDocument, variables),
    ...options
  }
    )};

export const EventSelectAvailableEventsDocument = new TypedDocumentString(`
    query EventSelectAvailableEvents($filters: EventPaginationFilters!) {
  events(filters: $filters) {
    __typename
    ... on GetEventsPagedResponse {
      data {
        id
        title
        icon
        eventDate
      }
    }
  }
}
    `);

export const useEventSelectAvailableEventsQuery = <
      TData = EventSelectAvailableEventsQuery,
      TError = unknown
    >(
      variables: EventSelectAvailableEventsQueryVariables,
      options?: Omit<UseQueryOptions<EventSelectAvailableEventsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<EventSelectAvailableEventsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<EventSelectAvailableEventsQuery, TError, TData>(
      {
    queryKey: ['EventSelectAvailableEvents', variables],
    queryFn: fetchGql<EventSelectAvailableEventsQuery, EventSelectAvailableEventsQueryVariables>(EventSelectAvailableEventsDocument, variables),
    ...options
  }
    )};

export const AdminEventListEventsDocument = new TypedDocumentString(`
    query AdminEventListEvents($filters: AdminEventPaginationFilters!) {
  adminEvents(filters: $filters) {
    __typename
    ... on GetEventsPagedResponse {
      data {
        id
        title
        icon
        eventDate
        wishlistIds
        createdAt
        attendees {
          id
          role
          user {
            id
            firstName
            lastName
          }
        }
      }
      pagination {
        totalPages
        totalElements
        pageNumber
        pageSize
      }
    }
  }
}
    `);

export const useAdminEventListEventsQuery = <
      TData = AdminEventListEventsQuery,
      TError = unknown
    >(
      variables: AdminEventListEventsQueryVariables,
      options?: Omit<UseQueryOptions<AdminEventListEventsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<AdminEventListEventsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<AdminEventListEventsQuery, TError, TData>(
      {
    queryKey: ['AdminEventListEvents', variables],
    queryFn: fetchGql<AdminEventListEventsQuery, AdminEventListEventsQueryVariables>(AdminEventListEventsDocument, variables),
    ...options
  }
    )};

export const AdminEventGetEventDocument = new TypedDocumentString(`
    query AdminEventGetEvent($id: EventId!) {
  adminEvent(id: $id) {
    __typename
    ... on Event {
      id
      title
      description
      icon
      eventDate
      createdAt
      attendees {
        id
        userId
        pendingEmail
        role
        user {
          id
          firstName
          lastName
          email
          pictureUrl
        }
      }
      wishlists {
        id
        title
        logoUrl
        config {
          hideItems
        }
        createdAt
        owner {
          id
          firstName
          lastName
          pictureUrl
        }
        coOwner {
          id
          firstName
          lastName
        }
      }
    }
  }
}
    `);

export const useAdminEventGetEventQuery = <
      TData = AdminEventGetEventQuery,
      TError = unknown
    >(
      variables: AdminEventGetEventQueryVariables,
      options?: Omit<UseQueryOptions<AdminEventGetEventQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<AdminEventGetEventQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<AdminEventGetEventQuery, TError, TData>(
      {
    queryKey: ['AdminEventGetEvent', variables],
    queryFn: fetchGql<AdminEventGetEventQuery, AdminEventGetEventQueryVariables>(AdminEventGetEventDocument, variables),
    ...options
  }
    )};

export const AdminUpdateEventDocument = new TypedDocumentString(`
    mutation AdminUpdateEvent($id: EventId!, $input: UpdateEventInput!) {
  adminUpdateEvent(id: $id, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAdminUpdateEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AdminUpdateEventMutation, TError, AdminUpdateEventMutationVariables, TContext>) => {
    
    return useMutation<AdminUpdateEventMutation, TError, AdminUpdateEventMutationVariables, TContext>(
      {
    mutationKey: ['AdminUpdateEvent'],
    mutationFn: (variables?: AdminUpdateEventMutationVariables) => fetchGql<AdminUpdateEventMutation, AdminUpdateEventMutationVariables>(AdminUpdateEventDocument, variables)(),
    ...options
  }
    )};

export const AdminDeleteEventDocument = new TypedDocumentString(`
    mutation AdminDeleteEvent($id: EventId!) {
  adminDeleteEvent(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useAdminDeleteEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AdminDeleteEventMutation, TError, AdminDeleteEventMutationVariables, TContext>) => {
    
    return useMutation<AdminDeleteEventMutation, TError, AdminDeleteEventMutationVariables, TContext>(
      {
    mutationKey: ['AdminDeleteEvent'],
    mutationFn: (variables?: AdminDeleteEventMutationVariables) => fetchGql<AdminDeleteEventMutation, AdminDeleteEventMutationVariables>(AdminDeleteEventDocument, variables)(),
    ...options
  }
    )};

export const AdminDeleteEventAttendeeDocument = new TypedDocumentString(`
    mutation AdminDeleteEventAttendee($eventId: EventId!, $attendeeId: AttendeeId!) {
  adminDeleteEventAttendee(eventId: $eventId, attendeeId: $attendeeId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useAdminDeleteEventAttendeeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AdminDeleteEventAttendeeMutation, TError, AdminDeleteEventAttendeeMutationVariables, TContext>) => {
    
    return useMutation<AdminDeleteEventAttendeeMutation, TError, AdminDeleteEventAttendeeMutationVariables, TContext>(
      {
    mutationKey: ['AdminDeleteEventAttendee'],
    mutationFn: (variables?: AdminDeleteEventAttendeeMutationVariables) => fetchGql<AdminDeleteEventAttendeeMutation, AdminDeleteEventAttendeeMutationVariables>(AdminDeleteEventAttendeeDocument, variables)(),
    ...options
  }
    )};

export const ImportableItemsDocument = new TypedDocumentString(`
    query ImportableItems($wishlistId: WishlistId!) {
  importableItems(wishlistId: $wishlistId) {
    __typename
    ... on GetImportableItemsOutput {
      items {
        id
        name
        description
        url
        score
        isSuggested
        pictureUrl
        takers {
          userId
          takenAt
          user {
            id
            firstName
            lastName
            pictureUrl
          }
        }
        createdAt
      }
    }
  }
}
    `);

export const useImportableItemsQuery = <
      TData = ImportableItemsQuery,
      TError = unknown
    >(
      variables: ImportableItemsQueryVariables,
      options?: Omit<UseQueryOptions<ImportableItemsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<ImportableItemsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<ImportableItemsQuery, TError, TData>(
      {
    queryKey: ['ImportableItems', variables],
    queryFn: fetchGql<ImportableItemsQuery, ImportableItemsQueryVariables>(ImportableItemsDocument, variables),
    ...options
  }
    )};

export const CreateItemDocument = new TypedDocumentString(`
    mutation CreateItem($input: CreateItemInput!) {
  createItem(input: $input) {
    __typename
    ... on Item {
      id
      name
      description
      url
      score
      isSuggested
      pictureUrl
      takers {
        userId
        takenAt
        user {
          id
          firstName
          lastName
          pictureUrl
        }
      }
      createdAt
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useCreateItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateItemMutation, TError, CreateItemMutationVariables, TContext>) => {
    
    return useMutation<CreateItemMutation, TError, CreateItemMutationVariables, TContext>(
      {
    mutationKey: ['CreateItem'],
    mutationFn: (variables?: CreateItemMutationVariables) => fetchGql<CreateItemMutation, CreateItemMutationVariables>(CreateItemDocument, variables)(),
    ...options
  }
    )};

export const UpdateItemDocument = new TypedDocumentString(`
    mutation UpdateItem($itemId: ItemId!, $input: UpdateItemInput!) {
  updateItem(itemId: $itemId, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUpdateItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateItemMutation, TError, UpdateItemMutationVariables, TContext>) => {
    
    return useMutation<UpdateItemMutation, TError, UpdateItemMutationVariables, TContext>(
      {
    mutationKey: ['UpdateItem'],
    mutationFn: (variables?: UpdateItemMutationVariables) => fetchGql<UpdateItemMutation, UpdateItemMutationVariables>(UpdateItemDocument, variables)(),
    ...options
  }
    )};

export const DeleteItemDocument = new TypedDocumentString(`
    mutation DeleteItem($itemId: ItemId!) {
  deleteItem(itemId: $itemId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useDeleteItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteItemMutation, TError, DeleteItemMutationVariables, TContext>) => {
    
    return useMutation<DeleteItemMutation, TError, DeleteItemMutationVariables, TContext>(
      {
    mutationKey: ['DeleteItem'],
    mutationFn: (variables?: DeleteItemMutationVariables) => fetchGql<DeleteItemMutation, DeleteItemMutationVariables>(DeleteItemDocument, variables)(),
    ...options
  }
    )};

export const ToggleItemDocument = new TypedDocumentString(`
    mutation ToggleItem($itemId: ItemId!) {
  toggleItem(itemId: $itemId) {
    __typename
    ... on ToggleItemOutput {
      takers {
        userId
        takenAt
        user {
          id
          firstName
          lastName
          pictureUrl
        }
      }
    }
  }
}
    `);

export const useToggleItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ToggleItemMutation, TError, ToggleItemMutationVariables, TContext>) => {
    
    return useMutation<ToggleItemMutation, TError, ToggleItemMutationVariables, TContext>(
      {
    mutationKey: ['ToggleItem'],
    mutationFn: (variables?: ToggleItemMutationVariables) => fetchGql<ToggleItemMutation, ToggleItemMutationVariables>(ToggleItemDocument, variables)(),
    ...options
  }
    )};

export const ScanItemUrlDocument = new TypedDocumentString(`
    mutation ScanItemUrl($input: ScanItemUrlInput!) {
  scanItemUrl(input: $input) {
    __typename
    ... on ScanItemUrlOutput {
      pictureUrl
    }
  }
}
    `);

export const useScanItemUrlMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ScanItemUrlMutation, TError, ScanItemUrlMutationVariables, TContext>) => {
    
    return useMutation<ScanItemUrlMutation, TError, ScanItemUrlMutationVariables, TContext>(
      {
    mutationKey: ['ScanItemUrl'],
    mutationFn: (variables?: ScanItemUrlMutationVariables) => fetchGql<ScanItemUrlMutation, ScanItemUrlMutationVariables>(ScanItemUrlDocument, variables)(),
    ...options
  }
    )};

export const ImportItemsDocument = new TypedDocumentString(`
    mutation ImportItems($input: ImportItemsInput!) {
  importItems(input: $input) {
    __typename
    ... on ImportItemsOutput {
      items {
        id
        name
        description
        url
        score
        isSuggested
        pictureUrl
        takers {
          userId
          takenAt
          user {
            id
            firstName
            lastName
            pictureUrl
          }
        }
        createdAt
      }
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useImportItemsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ImportItemsMutation, TError, ImportItemsMutationVariables, TContext>) => {
    
    return useMutation<ImportItemsMutation, TError, ImportItemsMutationVariables, TContext>(
      {
    mutationKey: ['ImportItems'],
    mutationFn: (variables?: ImportItemsMutationVariables) => fetchGql<ImportItemsMutation, ImportItemsMutationVariables>(ImportItemsDocument, variables)(),
    ...options
  }
    )};

export const GetSecretSantaForEventDocument = new TypedDocumentString(`
    query GetSecretSantaForEvent($eventId: EventId!) {
  secretSanta(eventId: $eventId) {
    __typename
    ...SecretSantaItem
  }
}
    fragment SecretSantaUserItem on SecretSantaUser {
  id
  attendeeId
  exclusions
  attendee {
    id
    pendingEmail
    role
    userId
    user {
      id
      firstName
      lastName
      email
      pictureUrl
    }
  }
}
fragment SecretSantaItem on SecretSanta {
  id
  eventId
  description
  budget
  status
  createdAt
  updatedAt
  users {
    ...SecretSantaUserItem
  }
}`);

export const useGetSecretSantaForEventQuery = <
      TData = GetSecretSantaForEventQuery,
      TError = unknown
    >(
      variables: GetSecretSantaForEventQueryVariables,
      options?: Omit<UseQueryOptions<GetSecretSantaForEventQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetSecretSantaForEventQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetSecretSantaForEventQuery, TError, TData>(
      {
    queryKey: ['GetSecretSantaForEvent', variables],
    queryFn: fetchGql<GetSecretSantaForEventQuery, GetSecretSantaForEventQueryVariables>(GetSecretSantaForEventDocument, variables),
    ...options
  }
    )};

export const GetMySecretSantaDrawDocument = new TypedDocumentString(`
    query GetMySecretSantaDraw($eventId: EventId!) {
  mySecretSantaDraw(eventId: $eventId) {
    __typename
    ... on EventAttendee {
      id
      pendingEmail
      role
      userId
      user {
        id
        firstName
        lastName
        email
        pictureUrl
      }
    }
  }
}
    `);

export const useGetMySecretSantaDrawQuery = <
      TData = GetMySecretSantaDrawQuery,
      TError = unknown
    >(
      variables: GetMySecretSantaDrawQueryVariables,
      options?: Omit<UseQueryOptions<GetMySecretSantaDrawQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetMySecretSantaDrawQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetMySecretSantaDrawQuery, TError, TData>(
      {
    queryKey: ['GetMySecretSantaDraw', variables],
    queryFn: fetchGql<GetMySecretSantaDrawQuery, GetMySecretSantaDrawQueryVariables>(GetMySecretSantaDrawDocument, variables),
    ...options
  }
    )};

export const CreateSecretSantaDocument = new TypedDocumentString(`
    mutation CreateSecretSanta($input: CreateSecretSantaInput!) {
  createSecretSanta(input: $input) {
    __typename
    ...SecretSantaItem
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    fragment SecretSantaUserItem on SecretSantaUser {
  id
  attendeeId
  exclusions
  attendee {
    id
    pendingEmail
    role
    userId
    user {
      id
      firstName
      lastName
      email
      pictureUrl
    }
  }
}
fragment SecretSantaItem on SecretSanta {
  id
  eventId
  description
  budget
  status
  createdAt
  updatedAt
  users {
    ...SecretSantaUserItem
  }
}`);

export const useCreateSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CreateSecretSantaMutation, TError, CreateSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<CreateSecretSantaMutation, TError, CreateSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['CreateSecretSanta'],
    mutationFn: (variables?: CreateSecretSantaMutationVariables) => fetchGql<CreateSecretSantaMutation, CreateSecretSantaMutationVariables>(CreateSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const UpdateSecretSantaDocument = new TypedDocumentString(`
    mutation UpdateSecretSanta($id: SecretSantaId!, $input: UpdateSecretSantaInput!) {
  updateSecretSanta(id: $id, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUpdateSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateSecretSantaMutation, TError, UpdateSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<UpdateSecretSantaMutation, TError, UpdateSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSecretSanta'],
    mutationFn: (variables?: UpdateSecretSantaMutationVariables) => fetchGql<UpdateSecretSantaMutation, UpdateSecretSantaMutationVariables>(UpdateSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const DeleteSecretSantaDocument = new TypedDocumentString(`
    mutation DeleteSecretSanta($id: SecretSantaId!) {
  deleteSecretSanta(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useDeleteSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteSecretSantaMutation, TError, DeleteSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<DeleteSecretSantaMutation, TError, DeleteSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['DeleteSecretSanta'],
    mutationFn: (variables?: DeleteSecretSantaMutationVariables) => fetchGql<DeleteSecretSantaMutation, DeleteSecretSantaMutationVariables>(DeleteSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const StartSecretSantaDocument = new TypedDocumentString(`
    mutation StartSecretSanta($id: SecretSantaId!) {
  startSecretSanta(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useStartSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<StartSecretSantaMutation, TError, StartSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<StartSecretSantaMutation, TError, StartSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['StartSecretSanta'],
    mutationFn: (variables?: StartSecretSantaMutationVariables) => fetchGql<StartSecretSantaMutation, StartSecretSantaMutationVariables>(StartSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const CancelSecretSantaDocument = new TypedDocumentString(`
    mutation CancelSecretSanta($id: SecretSantaId!) {
  cancelSecretSanta(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useCancelSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<CancelSecretSantaMutation, TError, CancelSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<CancelSecretSantaMutation, TError, CancelSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['CancelSecretSanta'],
    mutationFn: (variables?: CancelSecretSantaMutationVariables) => fetchGql<CancelSecretSantaMutation, CancelSecretSantaMutationVariables>(CancelSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const AddSecretSantaUsersDocument = new TypedDocumentString(`
    mutation AddSecretSantaUsers($id: SecretSantaId!, $input: AddSecretSantaUsersInput!) {
  addSecretSantaUsers(id: $id, input: $input) {
    __typename
    ... on AddSecretSantaUsersOutput {
      users {
        ...SecretSantaUserItem
      }
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    fragment SecretSantaUserItem on SecretSantaUser {
  id
  attendeeId
  exclusions
  attendee {
    id
    pendingEmail
    role
    userId
    user {
      id
      firstName
      lastName
      email
      pictureUrl
    }
  }
}`);

export const useAddSecretSantaUsersMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AddSecretSantaUsersMutation, TError, AddSecretSantaUsersMutationVariables, TContext>) => {
    
    return useMutation<AddSecretSantaUsersMutation, TError, AddSecretSantaUsersMutationVariables, TContext>(
      {
    mutationKey: ['AddSecretSantaUsers'],
    mutationFn: (variables?: AddSecretSantaUsersMutationVariables) => fetchGql<AddSecretSantaUsersMutation, AddSecretSantaUsersMutationVariables>(AddSecretSantaUsersDocument, variables)(),
    ...options
  }
    )};

export const UpdateSecretSantaUserDocument = new TypedDocumentString(`
    mutation UpdateSecretSantaUser($id: SecretSantaId!, $secretSantaUserId: SecretSantaUserId!, $input: UpdateSecretSantaUserInput!) {
  updateSecretSantaUser(
    id: $id
    secretSantaUserId: $secretSantaUserId
    input: $input
  ) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUpdateSecretSantaUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateSecretSantaUserMutation, TError, UpdateSecretSantaUserMutationVariables, TContext>) => {
    
    return useMutation<UpdateSecretSantaUserMutation, TError, UpdateSecretSantaUserMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSecretSantaUser'],
    mutationFn: (variables?: UpdateSecretSantaUserMutationVariables) => fetchGql<UpdateSecretSantaUserMutation, UpdateSecretSantaUserMutationVariables>(UpdateSecretSantaUserDocument, variables)(),
    ...options
  }
    )};

export const DeleteSecretSantaUserDocument = new TypedDocumentString(`
    mutation DeleteSecretSantaUser($id: SecretSantaId!, $secretSantaUserId: SecretSantaUserId!) {
  deleteSecretSantaUser(id: $id, secretSantaUserId: $secretSantaUserId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useDeleteSecretSantaUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteSecretSantaUserMutation, TError, DeleteSecretSantaUserMutationVariables, TContext>) => {
    
    return useMutation<DeleteSecretSantaUserMutation, TError, DeleteSecretSantaUserMutationVariables, TContext>(
      {
    mutationKey: ['DeleteSecretSantaUser'],
    mutationFn: (variables?: DeleteSecretSantaUserMutationVariables) => fetchGql<DeleteSecretSantaUserMutation, DeleteSecretSantaUserMutationVariables>(DeleteSecretSantaUserDocument, variables)(),
    ...options
  }
    )};

export const AdminUsersListDocument = new TypedDocumentString(`
    query AdminUsersList($input: AdminGetAllUsersPaginationFilters) {
  adminUsers(input: $input) {
    __typename
    ... on AdminGetAllUsers {
      data {
        id
        firstName
        lastName
        email
        pictureUrl
        isEnabled
        authorities
        createdAt
      }
      pagination {
        totalPages
        totalElements
        pageNumber
        pageSize
      }
    }
  }
}
    `);

export const useAdminUsersListQuery = <
      TData = AdminUsersListQuery,
      TError = unknown
    >(
      variables?: AdminUsersListQueryVariables,
      options?: Omit<UseQueryOptions<AdminUsersListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<AdminUsersListQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<AdminUsersListQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['AdminUsersList'] : ['AdminUsersList', variables],
    queryFn: fetchGql<AdminUsersListQuery, AdminUsersListQueryVariables>(AdminUsersListDocument, variables),
    ...options
  }
    )};

export const AdminUserDetailDocument = new TypedDocumentString(`
    query AdminUserDetail($userId: UserId!) {
  adminUser(userId: $userId) {
    __typename
    ... on UserFull {
      id
      firstName
      lastName
      email
      birthday
      pictureUrl
      isEnabled
      authorities
      createdAt
      lastConnectedAt
      lastIp
      accounts {
        id
        provider
        email
        pictureUrl
        createdAt
      }
    }
  }
}
    `);

export const useAdminUserDetailQuery = <
      TData = AdminUserDetailQuery,
      TError = unknown
    >(
      variables: AdminUserDetailQueryVariables,
      options?: Omit<UseQueryOptions<AdminUserDetailQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<AdminUserDetailQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<AdminUserDetailQuery, TError, TData>(
      {
    queryKey: ['AdminUserDetail', variables],
    queryFn: fetchGql<AdminUserDetailQuery, AdminUserDetailQueryVariables>(AdminUserDetailDocument, variables),
    ...options
  }
    )};

export const AdminUpdateUserProfileDocument = new TypedDocumentString(`
    mutation AdminUpdateUserProfile($userId: UserId!, $input: AdminUpdateUserProfileInput!) {
  adminUpdateUserProfile(userId: $userId, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAdminUpdateUserProfileMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AdminUpdateUserProfileMutation, TError, AdminUpdateUserProfileMutationVariables, TContext>) => {
    
    return useMutation<AdminUpdateUserProfileMutation, TError, AdminUpdateUserProfileMutationVariables, TContext>(
      {
    mutationKey: ['AdminUpdateUserProfile'],
    mutationFn: (variables?: AdminUpdateUserProfileMutationVariables) => fetchGql<AdminUpdateUserProfileMutation, AdminUpdateUserProfileMutationVariables>(AdminUpdateUserProfileDocument, variables)(),
    ...options
  }
    )};

export const AdminDeleteUserDocument = new TypedDocumentString(`
    mutation AdminDeleteUser($userId: UserId!) {
  adminDeleteUser(userId: $userId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useAdminDeleteUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AdminDeleteUserMutation, TError, AdminDeleteUserMutationVariables, TContext>) => {
    
    return useMutation<AdminDeleteUserMutation, TError, AdminDeleteUserMutationVariables, TContext>(
      {
    mutationKey: ['AdminDeleteUser'],
    mutationFn: (variables?: AdminDeleteUserMutationVariables) => fetchGql<AdminDeleteUserMutation, AdminDeleteUserMutationVariables>(AdminDeleteUserDocument, variables)(),
    ...options
  }
    )};

export const AdminRemoveUserPictureDocument = new TypedDocumentString(`
    mutation AdminRemoveUserPicture($userId: UserId!) {
  adminRemoveUserPicture(userId: $userId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useAdminRemoveUserPictureMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AdminRemoveUserPictureMutation, TError, AdminRemoveUserPictureMutationVariables, TContext>) => {
    
    return useMutation<AdminRemoveUserPictureMutation, TError, AdminRemoveUserPictureMutationVariables, TContext>(
      {
    mutationKey: ['AdminRemoveUserPicture'],
    mutationFn: (variables?: AdminRemoveUserPictureMutationVariables) => fetchGql<AdminRemoveUserPictureMutation, AdminRemoveUserPictureMutationVariables>(AdminRemoveUserPictureDocument, variables)(),
    ...options
  }
    )};

export const UserProfileCurrentUserDocument = new TypedDocumentString(`
    query UserProfileCurrentUser {
  currentUser {
    __typename
    ... on User {
      id
      email
      firstName
      lastName
      birthday
      pictureUrl
      createdAt
      accounts {
        id
        provider
        email
        pictureUrl
        createdAt
        updatedAt
      }
    }
  }
}
    `);

export const useUserProfileCurrentUserQuery = <
      TData = UserProfileCurrentUserQuery,
      TError = unknown
    >(
      variables?: UserProfileCurrentUserQueryVariables,
      options?: Omit<UseQueryOptions<UserProfileCurrentUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<UserProfileCurrentUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<UserProfileCurrentUserQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserProfileCurrentUser'] : ['UserProfileCurrentUser', variables],
    queryFn: fetchGql<UserProfileCurrentUserQuery, UserProfileCurrentUserQueryVariables>(UserProfileCurrentUserDocument, variables),
    ...options
  }
    )};

export const UserProfileEmailSettingsDocument = new TypedDocumentString(`
    query UserProfileEmailSettings {
  currentUser {
    __typename
    ... on User {
      id
      emailSettings {
        dailyNewItemNotification
      }
    }
  }
}
    `);

export const useUserProfileEmailSettingsQuery = <
      TData = UserProfileEmailSettingsQuery,
      TError = unknown
    >(
      variables?: UserProfileEmailSettingsQueryVariables,
      options?: Omit<UseQueryOptions<UserProfileEmailSettingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<UserProfileEmailSettingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<UserProfileEmailSettingsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserProfileEmailSettings'] : ['UserProfileEmailSettings', variables],
    queryFn: fetchGql<UserProfileEmailSettingsQuery, UserProfileEmailSettingsQueryVariables>(UserProfileEmailSettingsDocument, variables),
    ...options
  }
    )};

export const UserPendingEmailChangeDocument = new TypedDocumentString(`
    query UserPendingEmailChange {
  pendingEmailChange {
    __typename
    ... on PendingEmailChange {
      newEmail
      expiredAt
    }
  }
}
    `);

export const useUserPendingEmailChangeQuery = <
      TData = UserPendingEmailChangeQuery,
      TError = unknown
    >(
      variables?: UserPendingEmailChangeQueryVariables,
      options?: Omit<UseQueryOptions<UserPendingEmailChangeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<UserPendingEmailChangeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<UserPendingEmailChangeQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserPendingEmailChange'] : ['UserPendingEmailChange', variables],
    queryFn: fetchGql<UserPendingEmailChangeQuery, UserPendingEmailChangeQueryVariables>(UserPendingEmailChangeDocument, variables),
    ...options
  }
    )};

export const SearchUsersSelectDocument = new TypedDocumentString(`
    query SearchUsersSelect($keyword: String!) {
  searchUsers(keyword: $keyword) {
    __typename
    ... on SearchUsersOutput {
      users {
        id
        firstName
        lastName
        email
        pictureUrl
      }
    }
  }
}
    `);

export const useSearchUsersSelectQuery = <
      TData = SearchUsersSelectQuery,
      TError = unknown
    >(
      variables: SearchUsersSelectQueryVariables,
      options?: Omit<UseQueryOptions<SearchUsersSelectQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<SearchUsersSelectQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<SearchUsersSelectQuery, TError, TData>(
      {
    queryKey: ['SearchUsersSelect', variables],
    queryFn: fetchGql<SearchUsersSelectQuery, SearchUsersSelectQueryVariables>(SearchUsersSelectDocument, variables),
    ...options
  }
    )};

export const UserClosestFriendsDocument = new TypedDocumentString(`
    query UserClosestFriends($limit: Int) {
  closestFriends(limit: $limit) {
    __typename
    ... on ClosestFriendsOutput {
      users {
        id
        firstName
        lastName
        email
        pictureUrl
      }
    }
  }
}
    `);

export const useUserClosestFriendsQuery = <
      TData = UserClosestFriendsQuery,
      TError = unknown
    >(
      variables?: UserClosestFriendsQueryVariables,
      options?: Omit<UseQueryOptions<UserClosestFriendsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<UserClosestFriendsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<UserClosestFriendsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserClosestFriends'] : ['UserClosestFriends', variables],
    queryFn: fetchGql<UserClosestFriendsQuery, UserClosestFriendsQueryVariables>(UserClosestFriendsDocument, variables),
    ...options
  }
    )};

export const UpdateUserProfileDocument = new TypedDocumentString(`
    mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
  updateUserProfile(input: $input) {
    __typename
    ... on User {
      id
      firstName
      lastName
      birthday
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUpdateUserProfileMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateUserProfileMutation, TError, UpdateUserProfileMutationVariables, TContext>) => {
    
    return useMutation<UpdateUserProfileMutation, TError, UpdateUserProfileMutationVariables, TContext>(
      {
    mutationKey: ['UpdateUserProfile'],
    mutationFn: (variables?: UpdateUserProfileMutationVariables) => fetchGql<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>(UpdateUserProfileDocument, variables)(),
    ...options
  }
    )};

export const ChangeUserPasswordDocument = new TypedDocumentString(`
    mutation ChangeUserPassword($input: ChangeUserPasswordInput!) {
  changeUserPassword(input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
    ... on BusinessRuleRejection {
      code
      message
    }
  }
}
    `);

export const useChangeUserPasswordMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<ChangeUserPasswordMutation, TError, ChangeUserPasswordMutationVariables, TContext>) => {
    
    return useMutation<ChangeUserPasswordMutation, TError, ChangeUserPasswordMutationVariables, TContext>(
      {
    mutationKey: ['ChangeUserPassword'],
    mutationFn: (variables?: ChangeUserPasswordMutationVariables) => fetchGql<ChangeUserPasswordMutation, ChangeUserPasswordMutationVariables>(ChangeUserPasswordDocument, variables)(),
    ...options
  }
    )};

export const UpdateUserEmailSettingsDocument = new TypedDocumentString(`
    mutation UpdateUserEmailSettings($input: UpdateUserEmailSettingsInput!) {
  updateUserEmailSettings(input: $input) {
    __typename
    ... on UserEmailSettings {
      dailyNewItemNotification
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUpdateUserEmailSettingsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateUserEmailSettingsMutation, TError, UpdateUserEmailSettingsMutationVariables, TContext>) => {
    
    return useMutation<UpdateUserEmailSettingsMutation, TError, UpdateUserEmailSettingsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateUserEmailSettings'],
    mutationFn: (variables?: UpdateUserEmailSettingsMutationVariables) => fetchGql<UpdateUserEmailSettingsMutation, UpdateUserEmailSettingsMutationVariables>(UpdateUserEmailSettingsDocument, variables)(),
    ...options
  }
    )};

export const LinkCurrentUserWithGoogleDocument = new TypedDocumentString(`
    mutation LinkCurrentUserWithGoogle($input: LinkUserToGoogleInput!) {
  linkCurrentUserWithGoogle(input: $input) {
    __typename
    ... on UserAccount {
      id
      provider
      email
      pictureUrl
      createdAt
      updatedAt
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useLinkCurrentUserWithGoogleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<LinkCurrentUserWithGoogleMutation, TError, LinkCurrentUserWithGoogleMutationVariables, TContext>) => {
    
    return useMutation<LinkCurrentUserWithGoogleMutation, TError, LinkCurrentUserWithGoogleMutationVariables, TContext>(
      {
    mutationKey: ['LinkCurrentUserWithGoogle'],
    mutationFn: (variables?: LinkCurrentUserWithGoogleMutationVariables) => fetchGql<LinkCurrentUserWithGoogleMutation, LinkCurrentUserWithGoogleMutationVariables>(LinkCurrentUserWithGoogleDocument, variables)(),
    ...options
  }
    )};

export const UnlinkCurrentUserAccountDocument = new TypedDocumentString(`
    mutation UnlinkCurrentUserAccount($accountId: UserAccountId!) {
  unlinkCurrentUserAccount(accountId: $accountId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useUnlinkCurrentUserAccountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UnlinkCurrentUserAccountMutation, TError, UnlinkCurrentUserAccountMutationVariables, TContext>) => {
    
    return useMutation<UnlinkCurrentUserAccountMutation, TError, UnlinkCurrentUserAccountMutationVariables, TContext>(
      {
    mutationKey: ['UnlinkCurrentUserAccount'],
    mutationFn: (variables?: UnlinkCurrentUserAccountMutationVariables) => fetchGql<UnlinkCurrentUserAccountMutation, UnlinkCurrentUserAccountMutationVariables>(UnlinkCurrentUserAccountDocument, variables)(),
    ...options
  }
    )};

export const UpdateUserPictureFromAccountDocument = new TypedDocumentString(`
    mutation UpdateUserPictureFromAccount($input: UpdateUserPictureFromAccountInput!) {
  updateUserPictureFromAccount(input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useUpdateUserPictureFromAccountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateUserPictureFromAccountMutation, TError, UpdateUserPictureFromAccountMutationVariables, TContext>) => {
    
    return useMutation<UpdateUserPictureFromAccountMutation, TError, UpdateUserPictureFromAccountMutationVariables, TContext>(
      {
    mutationKey: ['UpdateUserPictureFromAccount'],
    mutationFn: (variables?: UpdateUserPictureFromAccountMutationVariables) => fetchGql<UpdateUserPictureFromAccountMutation, UpdateUserPictureFromAccountMutationVariables>(UpdateUserPictureFromAccountDocument, variables)(),
    ...options
  }
    )};

export const RemoveCurrentUserPictureDocument = new TypedDocumentString(`
    mutation RemoveCurrentUserPicture {
  removeUserPicture {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useRemoveCurrentUserPictureMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveCurrentUserPictureMutation, TError, RemoveCurrentUserPictureMutationVariables, TContext>) => {
    
    return useMutation<RemoveCurrentUserPictureMutation, TError, RemoveCurrentUserPictureMutationVariables, TContext>(
      {
    mutationKey: ['RemoveCurrentUserPicture'],
    mutationFn: (variables?: RemoveCurrentUserPictureMutationVariables) => fetchGql<RemoveCurrentUserPictureMutation, RemoveCurrentUserPictureMutationVariables>(RemoveCurrentUserPictureDocument, variables)(),
    ...options
  }
    )};

export const RequestUserEmailChangeDocument = new TypedDocumentString(`
    mutation RequestUserEmailChange($input: RequestEmailChangeInput!) {
  requestEmailChange(input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useRequestUserEmailChangeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RequestUserEmailChangeMutation, TError, RequestUserEmailChangeMutationVariables, TContext>) => {
    
    return useMutation<RequestUserEmailChangeMutation, TError, RequestUserEmailChangeMutationVariables, TContext>(
      {
    mutationKey: ['RequestUserEmailChange'],
    mutationFn: (variables?: RequestUserEmailChangeMutationVariables) => fetchGql<RequestUserEmailChangeMutation, RequestUserEmailChangeMutationVariables>(RequestUserEmailChangeDocument, variables)(),
    ...options
  }
    )};

export const WishlistListPageDocument = new TypedDocumentString(`
    query WishlistListPage($filters: PaginationFilters!) {
  wishlists(filters: $filters) {
    __typename
    ... on GetWishlistsPagedResponse {
      data {
        id
        title
        description
        logoUrl
        config {
          hideItems
        }
        events {
          id
          title
          icon
          eventDate
        }
      }
      pagination {
        totalPages
        totalElements
        pageNumber
        pageSize
      }
    }
  }
}
    `);

export const useWishlistListPageQuery = <
      TData = WishlistListPageQuery,
      TError = unknown
    >(
      variables: WishlistListPageQueryVariables,
      options?: Omit<UseQueryOptions<WishlistListPageQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<WishlistListPageQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<WishlistListPageQuery, TError, TData>(
      {
    queryKey: ['WishlistListPage', variables],
    queryFn: fetchGql<WishlistListPageQuery, WishlistListPageQueryVariables>(WishlistListPageDocument, variables),
    ...options
  }
    )};

export const UpdateWishlistDocument = new TypedDocumentString(`
    mutation UpdateWishlist($id: WishlistId!, $input: UpdateWishlistInput!) {
  updateWishlist(id: $id, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUpdateWishlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UpdateWishlistMutation, TError, UpdateWishlistMutationVariables, TContext>) => {
    
    return useMutation<UpdateWishlistMutation, TError, UpdateWishlistMutationVariables, TContext>(
      {
    mutationKey: ['UpdateWishlist'],
    mutationFn: (variables?: UpdateWishlistMutationVariables) => fetchGql<UpdateWishlistMutation, UpdateWishlistMutationVariables>(UpdateWishlistDocument, variables)(),
    ...options
  }
    )};

export const DeleteWishlistDocument = new TypedDocumentString(`
    mutation DeleteWishlist($id: WishlistId!) {
  deleteWishlist(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useDeleteWishlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<DeleteWishlistMutation, TError, DeleteWishlistMutationVariables, TContext>) => {
    
    return useMutation<DeleteWishlistMutation, TError, DeleteWishlistMutationVariables, TContext>(
      {
    mutationKey: ['DeleteWishlist'],
    mutationFn: (variables?: DeleteWishlistMutationVariables) => fetchGql<DeleteWishlistMutation, DeleteWishlistMutationVariables>(DeleteWishlistDocument, variables)(),
    ...options
  }
    )};

export const LinkWishlistToEventDocument = new TypedDocumentString(`
    mutation LinkWishlistToEvent($id: WishlistId!, $eventId: EventId!) {
  linkWishlistToEvent(id: $id, eventId: $eventId) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useLinkWishlistToEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<LinkWishlistToEventMutation, TError, LinkWishlistToEventMutationVariables, TContext>) => {
    
    return useMutation<LinkWishlistToEventMutation, TError, LinkWishlistToEventMutationVariables, TContext>(
      {
    mutationKey: ['LinkWishlistToEvent'],
    mutationFn: (variables?: LinkWishlistToEventMutationVariables) => fetchGql<LinkWishlistToEventMutation, LinkWishlistToEventMutationVariables>(LinkWishlistToEventDocument, variables)(),
    ...options
  }
    )};

export const UnlinkWishlistFromEventDocument = new TypedDocumentString(`
    mutation UnlinkWishlistFromEvent($id: WishlistId!, $eventId: EventId!) {
  unlinkWishlistFromEvent(id: $id, eventId: $eventId) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useUnlinkWishlistFromEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<UnlinkWishlistFromEventMutation, TError, UnlinkWishlistFromEventMutationVariables, TContext>) => {
    
    return useMutation<UnlinkWishlistFromEventMutation, TError, UnlinkWishlistFromEventMutationVariables, TContext>(
      {
    mutationKey: ['UnlinkWishlistFromEvent'],
    mutationFn: (variables?: UnlinkWishlistFromEventMutationVariables) => fetchGql<UnlinkWishlistFromEventMutation, UnlinkWishlistFromEventMutationVariables>(UnlinkWishlistFromEventDocument, variables)(),
    ...options
  }
    )};

export const AddWishlistCoOwnerDocument = new TypedDocumentString(`
    mutation AddWishlistCoOwner($id: WishlistId!, $input: AddWishlistCoOwnerInput!) {
  addWishlistCoOwner(id: $id, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `);

export const useAddWishlistCoOwnerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<AddWishlistCoOwnerMutation, TError, AddWishlistCoOwnerMutationVariables, TContext>) => {
    
    return useMutation<AddWishlistCoOwnerMutation, TError, AddWishlistCoOwnerMutationVariables, TContext>(
      {
    mutationKey: ['AddWishlistCoOwner'],
    mutationFn: (variables?: AddWishlistCoOwnerMutationVariables) => fetchGql<AddWishlistCoOwnerMutation, AddWishlistCoOwnerMutationVariables>(AddWishlistCoOwnerDocument, variables)(),
    ...options
  }
    )};

export const RemoveWishlistCoOwnerDocument = new TypedDocumentString(`
    mutation RemoveWishlistCoOwner($id: WishlistId!) {
  removeWishlistCoOwner(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useRemoveWishlistCoOwnerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveWishlistCoOwnerMutation, TError, RemoveWishlistCoOwnerMutationVariables, TContext>) => {
    
    return useMutation<RemoveWishlistCoOwnerMutation, TError, RemoveWishlistCoOwnerMutationVariables, TContext>(
      {
    mutationKey: ['RemoveWishlistCoOwner'],
    mutationFn: (variables?: RemoveWishlistCoOwnerMutationVariables) => fetchGql<RemoveWishlistCoOwnerMutation, RemoveWishlistCoOwnerMutationVariables>(RemoveWishlistCoOwnerDocument, variables)(),
    ...options
  }
    )};

export const RemoveWishlistLogoDocument = new TypedDocumentString(`
    mutation RemoveWishlistLogo($id: WishlistId!) {
  removeWishlistLogo(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `);

export const useRemoveWishlistLogoMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<RemoveWishlistLogoMutation, TError, RemoveWishlistLogoMutationVariables, TContext>) => {
    
    return useMutation<RemoveWishlistLogoMutation, TError, RemoveWishlistLogoMutationVariables, TContext>(
      {
    mutationKey: ['RemoveWishlistLogo'],
    mutationFn: (variables?: RemoveWishlistLogoMutationVariables) => fetchGql<RemoveWishlistLogoMutation, RemoveWishlistLogoMutationVariables>(RemoveWishlistLogoDocument, variables)(),
    ...options
  }
    )};

export const WishlistPageDocument = new TypedDocumentString(`
    query WishlistPage($wishlistId: WishlistId!) {
  wishlist(id: $wishlistId) {
    __typename
    ... on Wishlist {
      id
      title
      description
      logoUrl
      ownerId
      coOwnerId
      config {
        hideItems
      }
      owner {
        id
        firstName
        lastName
        email
        pictureUrl
      }
      coOwner {
        id
        firstName
        lastName
        email
        pictureUrl
      }
      events {
        id
        title
        icon
        eventDate
      }
      items {
        id
        name
        description
        url
        score
        isSuggested
        pictureUrl
        takers {
          userId
          takenAt
          user {
            id
            firstName
            lastName
            pictureUrl
          }
        }
        createdAt
      }
      createdAt
      updatedAt
    }
    ... on NotFoundRejection {
      __typename
    }
  }
}
    `);

export const useWishlistPageQuery = <
      TData = WishlistPageQuery,
      TError = unknown
    >(
      variables: WishlistPageQueryVariables,
      options?: Omit<UseQueryOptions<WishlistPageQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<WishlistPageQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<WishlistPageQuery, TError, TData>(
      {
    queryKey: ['WishlistPage', variables],
    queryFn: fetchGql<WishlistPageQuery, WishlistPageQueryVariables>(WishlistPageDocument, variables),
    ...options
  }
    )};

export const AdminListWishlistsForUserDocument = new TypedDocumentString(`
    query AdminListWishlistsForUser($filters: AdminWishlistPaginationFilters!) {
  adminWishlists(filters: $filters) {
    __typename
    ... on AdminGetWishlists {
      data {
        id
        title
        logoUrl
        coOwnerId
        config {
          hideItems
        }
        createdAt
        events {
          id
          title
        }
      }
      pagination {
        totalPages
        totalElements
        pageNumber
        pageSize
      }
    }
  }
}
    `);

export const useAdminListWishlistsForUserQuery = <
      TData = AdminListWishlistsForUserQuery,
      TError = unknown
    >(
      variables: AdminListWishlistsForUserQueryVariables,
      options?: Omit<UseQueryOptions<AdminListWishlistsForUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<AdminListWishlistsForUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<AdminListWishlistsForUserQuery, TError, TData>(
      {
    queryKey: ['AdminListWishlistsForUser', variables],
    queryFn: fetchGql<AdminListWishlistsForUserQuery, AdminListWishlistsForUserQueryVariables>(AdminListWishlistsForUserDocument, variables),
    ...options
  }
    )};
