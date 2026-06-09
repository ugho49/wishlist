import type * as Types from './types'
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { fetchGql } from '../fetcher';

export const SecretSantaUserItemFragmentDoc = `
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
    `;
export const SecretSantaItemFragmentDoc = `
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
    ${SecretSantaUserItemFragmentDoc}`;
export const AuthLoginDocument = `
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
    `;

export const useAuthLoginMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AuthLoginMutation, TError, Types.AuthLoginMutationVariables, TContext>) => {
    
    return useMutation<Types.AuthLoginMutation, TError, Types.AuthLoginMutationVariables, TContext>(
      {
    mutationKey: ['AuthLogin'],
    mutationFn: (variables?: Types.AuthLoginMutationVariables) => fetchGql<Types.AuthLoginMutation, Types.AuthLoginMutationVariables>(AuthLoginDocument, variables)(),
    ...options
  }
    )};

export const AuthLoginWithGoogleDocument = `
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
    `;

export const useAuthLoginWithGoogleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AuthLoginWithGoogleMutation, TError, Types.AuthLoginWithGoogleMutationVariables, TContext>) => {
    
    return useMutation<Types.AuthLoginWithGoogleMutation, TError, Types.AuthLoginWithGoogleMutationVariables, TContext>(
      {
    mutationKey: ['AuthLoginWithGoogle'],
    mutationFn: (variables?: Types.AuthLoginWithGoogleMutationVariables) => fetchGql<Types.AuthLoginWithGoogleMutation, Types.AuthLoginWithGoogleMutationVariables>(AuthLoginWithGoogleDocument, variables)(),
    ...options
  }
    )};

export const AuthRegisterUserDocument = `
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
    `;

export const useAuthRegisterUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AuthRegisterUserMutation, TError, Types.AuthRegisterUserMutationVariables, TContext>) => {
    
    return useMutation<Types.AuthRegisterUserMutation, TError, Types.AuthRegisterUserMutationVariables, TContext>(
      {
    mutationKey: ['AuthRegisterUser'],
    mutationFn: (variables?: Types.AuthRegisterUserMutationVariables) => fetchGql<Types.AuthRegisterUserMutation, Types.AuthRegisterUserMutationVariables>(AuthRegisterUserDocument, variables)(),
    ...options
  }
    )};

export const AuthSendResetPasswordEmailDocument = `
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
    `;

export const useAuthSendResetPasswordEmailMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AuthSendResetPasswordEmailMutation, TError, Types.AuthSendResetPasswordEmailMutationVariables, TContext>) => {
    
    return useMutation<Types.AuthSendResetPasswordEmailMutation, TError, Types.AuthSendResetPasswordEmailMutationVariables, TContext>(
      {
    mutationKey: ['AuthSendResetPasswordEmail'],
    mutationFn: (variables?: Types.AuthSendResetPasswordEmailMutationVariables) => fetchGql<Types.AuthSendResetPasswordEmailMutation, Types.AuthSendResetPasswordEmailMutationVariables>(AuthSendResetPasswordEmailDocument, variables)(),
    ...options
  }
    )};

export const AuthResetPasswordDocument = `
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
    `;

export const useAuthResetPasswordMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AuthResetPasswordMutation, TError, Types.AuthResetPasswordMutationVariables, TContext>) => {
    
    return useMutation<Types.AuthResetPasswordMutation, TError, Types.AuthResetPasswordMutationVariables, TContext>(
      {
    mutationKey: ['AuthResetPassword'],
    mutationFn: (variables?: Types.AuthResetPasswordMutationVariables) => fetchGql<Types.AuthResetPasswordMutation, Types.AuthResetPasswordMutationVariables>(AuthResetPasswordDocument, variables)(),
    ...options
  }
    )};

export const AuthConfirmEmailChangeDocument = `
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
    `;

export const useAuthConfirmEmailChangeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AuthConfirmEmailChangeMutation, TError, Types.AuthConfirmEmailChangeMutationVariables, TContext>) => {
    
    return useMutation<Types.AuthConfirmEmailChangeMutation, TError, Types.AuthConfirmEmailChangeMutationVariables, TContext>(
      {
    mutationKey: ['AuthConfirmEmailChange'],
    mutationFn: (variables?: Types.AuthConfirmEmailChangeMutationVariables) => fetchGql<Types.AuthConfirmEmailChangeMutation, Types.AuthConfirmEmailChangeMutationVariables>(AuthConfirmEmailChangeDocument, variables)(),
    ...options
  }
    )};

export const EventListPageGetEventsDocument = `
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
    `;

export const useEventListPageGetEventsQuery = <
      TData = Types.EventListPageGetEventsQuery,
      TError = unknown
    >(
      variables: Types.EventListPageGetEventsQueryVariables,
      options?: Omit<UseQueryOptions<Types.EventListPageGetEventsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.EventListPageGetEventsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.EventListPageGetEventsQuery, TError, TData>(
      {
    queryKey: ['EventListPageGetEvents', variables],
    queryFn: fetchGql<Types.EventListPageGetEventsQuery, Types.EventListPageGetEventsQueryVariables>(EventListPageGetEventsDocument, variables),
    ...options
  }
    )};

export const CreateEventDocument = `
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
    `;

export const useCreateEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.CreateEventMutation, TError, Types.CreateEventMutationVariables, TContext>) => {
    
    return useMutation<Types.CreateEventMutation, TError, Types.CreateEventMutationVariables, TContext>(
      {
    mutationKey: ['CreateEvent'],
    mutationFn: (variables?: Types.CreateEventMutationVariables) => fetchGql<Types.CreateEventMutation, Types.CreateEventMutationVariables>(CreateEventDocument, variables)(),
    ...options
  }
    )};

export const UpdateEventDocument = `
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
    `;

export const useUpdateEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateEventMutation, TError, Types.UpdateEventMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateEventMutation, TError, Types.UpdateEventMutationVariables, TContext>(
      {
    mutationKey: ['UpdateEvent'],
    mutationFn: (variables?: Types.UpdateEventMutationVariables) => fetchGql<Types.UpdateEventMutation, Types.UpdateEventMutationVariables>(UpdateEventDocument, variables)(),
    ...options
  }
    )};

export const DeleteEventDocument = `
    mutation DeleteEvent($id: EventId!) {
  deleteEvent(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useDeleteEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.DeleteEventMutation, TError, Types.DeleteEventMutationVariables, TContext>) => {
    
    return useMutation<Types.DeleteEventMutation, TError, Types.DeleteEventMutationVariables, TContext>(
      {
    mutationKey: ['DeleteEvent'],
    mutationFn: (variables?: Types.DeleteEventMutationVariables) => fetchGql<Types.DeleteEventMutation, Types.DeleteEventMutationVariables>(DeleteEventDocument, variables)(),
    ...options
  }
    )};

export const AddEventAttendeeDocument = `
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
    `;

export const useAddEventAttendeeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AddEventAttendeeMutation, TError, Types.AddEventAttendeeMutationVariables, TContext>) => {
    
    return useMutation<Types.AddEventAttendeeMutation, TError, Types.AddEventAttendeeMutationVariables, TContext>(
      {
    mutationKey: ['AddEventAttendee'],
    mutationFn: (variables?: Types.AddEventAttendeeMutationVariables) => fetchGql<Types.AddEventAttendeeMutation, Types.AddEventAttendeeMutationVariables>(AddEventAttendeeDocument, variables)(),
    ...options
  }
    )};

export const RemoveEventAttendeeDocument = `
    mutation RemoveEventAttendee($eventId: EventId!, $attendeeId: AttendeeId!) {
  removeEventAttendee(eventId: $eventId, attendeeId: $attendeeId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useRemoveEventAttendeeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.RemoveEventAttendeeMutation, TError, Types.RemoveEventAttendeeMutationVariables, TContext>) => {
    
    return useMutation<Types.RemoveEventAttendeeMutation, TError, Types.RemoveEventAttendeeMutationVariables, TContext>(
      {
    mutationKey: ['RemoveEventAttendee'],
    mutationFn: (variables?: Types.RemoveEventAttendeeMutationVariables) => fetchGql<Types.RemoveEventAttendeeMutation, Types.RemoveEventAttendeeMutationVariables>(RemoveEventAttendeeDocument, variables)(),
    ...options
  }
    )};

export const EventPageGetEventDocument = `
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
    `;

export const useEventPageGetEventQuery = <
      TData = Types.EventPageGetEventQuery,
      TError = unknown
    >(
      variables: Types.EventPageGetEventQueryVariables,
      options?: Omit<UseQueryOptions<Types.EventPageGetEventQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.EventPageGetEventQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.EventPageGetEventQuery, TError, TData>(
      {
    queryKey: ['EventPageGetEvent', variables],
    queryFn: fetchGql<Types.EventPageGetEventQuery, Types.EventPageGetEventQueryVariables>(EventPageGetEventDocument, variables),
    ...options
  }
    )};

export const EventSelectAvailableEventsDocument = `
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
    `;

export const useEventSelectAvailableEventsQuery = <
      TData = Types.EventSelectAvailableEventsQuery,
      TError = unknown
    >(
      variables: Types.EventSelectAvailableEventsQueryVariables,
      options?: Omit<UseQueryOptions<Types.EventSelectAvailableEventsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.EventSelectAvailableEventsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.EventSelectAvailableEventsQuery, TError, TData>(
      {
    queryKey: ['EventSelectAvailableEvents', variables],
    queryFn: fetchGql<Types.EventSelectAvailableEventsQuery, Types.EventSelectAvailableEventsQueryVariables>(EventSelectAvailableEventsDocument, variables),
    ...options
  }
    )};

export const AdminEventListEventsDocument = `
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
    `;

export const useAdminEventListEventsQuery = <
      TData = Types.AdminEventListEventsQuery,
      TError = unknown
    >(
      variables: Types.AdminEventListEventsQueryVariables,
      options?: Omit<UseQueryOptions<Types.AdminEventListEventsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.AdminEventListEventsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.AdminEventListEventsQuery, TError, TData>(
      {
    queryKey: ['AdminEventListEvents', variables],
    queryFn: fetchGql<Types.AdminEventListEventsQuery, Types.AdminEventListEventsQueryVariables>(AdminEventListEventsDocument, variables),
    ...options
  }
    )};

export const AdminEventGetEventDocument = `
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
    `;

export const useAdminEventGetEventQuery = <
      TData = Types.AdminEventGetEventQuery,
      TError = unknown
    >(
      variables: Types.AdminEventGetEventQueryVariables,
      options?: Omit<UseQueryOptions<Types.AdminEventGetEventQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.AdminEventGetEventQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.AdminEventGetEventQuery, TError, TData>(
      {
    queryKey: ['AdminEventGetEvent', variables],
    queryFn: fetchGql<Types.AdminEventGetEventQuery, Types.AdminEventGetEventQueryVariables>(AdminEventGetEventDocument, variables),
    ...options
  }
    )};

export const AdminUpdateEventDocument = `
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
    `;

export const useAdminUpdateEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AdminUpdateEventMutation, TError, Types.AdminUpdateEventMutationVariables, TContext>) => {
    
    return useMutation<Types.AdminUpdateEventMutation, TError, Types.AdminUpdateEventMutationVariables, TContext>(
      {
    mutationKey: ['AdminUpdateEvent'],
    mutationFn: (variables?: Types.AdminUpdateEventMutationVariables) => fetchGql<Types.AdminUpdateEventMutation, Types.AdminUpdateEventMutationVariables>(AdminUpdateEventDocument, variables)(),
    ...options
  }
    )};

export const AdminDeleteEventDocument = `
    mutation AdminDeleteEvent($id: EventId!) {
  adminDeleteEvent(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useAdminDeleteEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AdminDeleteEventMutation, TError, Types.AdminDeleteEventMutationVariables, TContext>) => {
    
    return useMutation<Types.AdminDeleteEventMutation, TError, Types.AdminDeleteEventMutationVariables, TContext>(
      {
    mutationKey: ['AdminDeleteEvent'],
    mutationFn: (variables?: Types.AdminDeleteEventMutationVariables) => fetchGql<Types.AdminDeleteEventMutation, Types.AdminDeleteEventMutationVariables>(AdminDeleteEventDocument, variables)(),
    ...options
  }
    )};

export const AdminDeleteEventAttendeeDocument = `
    mutation AdminDeleteEventAttendee($eventId: EventId!, $attendeeId: AttendeeId!) {
  adminDeleteEventAttendee(eventId: $eventId, attendeeId: $attendeeId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useAdminDeleteEventAttendeeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AdminDeleteEventAttendeeMutation, TError, Types.AdminDeleteEventAttendeeMutationVariables, TContext>) => {
    
    return useMutation<Types.AdminDeleteEventAttendeeMutation, TError, Types.AdminDeleteEventAttendeeMutationVariables, TContext>(
      {
    mutationKey: ['AdminDeleteEventAttendee'],
    mutationFn: (variables?: Types.AdminDeleteEventAttendeeMutationVariables) => fetchGql<Types.AdminDeleteEventAttendeeMutation, Types.AdminDeleteEventAttendeeMutationVariables>(AdminDeleteEventAttendeeDocument, variables)(),
    ...options
  }
    )};

export const ImportableItemsDocument = `
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
        takenById
        takenAt
        createdAt
        takerUser {
          id
          firstName
          pictureUrl
        }
      }
    }
  }
}
    `;

export const useImportableItemsQuery = <
      TData = Types.ImportableItemsQuery,
      TError = unknown
    >(
      variables: Types.ImportableItemsQueryVariables,
      options?: Omit<UseQueryOptions<Types.ImportableItemsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.ImportableItemsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.ImportableItemsQuery, TError, TData>(
      {
    queryKey: ['ImportableItems', variables],
    queryFn: fetchGql<Types.ImportableItemsQuery, Types.ImportableItemsQueryVariables>(ImportableItemsDocument, variables),
    ...options
  }
    )};

export const CreateItemDocument = `
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
      takenById
      takenAt
      createdAt
      takerUser {
        id
        firstName
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
    `;

export const useCreateItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.CreateItemMutation, TError, Types.CreateItemMutationVariables, TContext>) => {
    
    return useMutation<Types.CreateItemMutation, TError, Types.CreateItemMutationVariables, TContext>(
      {
    mutationKey: ['CreateItem'],
    mutationFn: (variables?: Types.CreateItemMutationVariables) => fetchGql<Types.CreateItemMutation, Types.CreateItemMutationVariables>(CreateItemDocument, variables)(),
    ...options
  }
    )};

export const UpdateItemDocument = `
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
    `;

export const useUpdateItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateItemMutation, TError, Types.UpdateItemMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateItemMutation, TError, Types.UpdateItemMutationVariables, TContext>(
      {
    mutationKey: ['UpdateItem'],
    mutationFn: (variables?: Types.UpdateItemMutationVariables) => fetchGql<Types.UpdateItemMutation, Types.UpdateItemMutationVariables>(UpdateItemDocument, variables)(),
    ...options
  }
    )};

export const DeleteItemDocument = `
    mutation DeleteItem($itemId: ItemId!) {
  deleteItem(itemId: $itemId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useDeleteItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.DeleteItemMutation, TError, Types.DeleteItemMutationVariables, TContext>) => {
    
    return useMutation<Types.DeleteItemMutation, TError, Types.DeleteItemMutationVariables, TContext>(
      {
    mutationKey: ['DeleteItem'],
    mutationFn: (variables?: Types.DeleteItemMutationVariables) => fetchGql<Types.DeleteItemMutation, Types.DeleteItemMutationVariables>(DeleteItemDocument, variables)(),
    ...options
  }
    )};

export const ToggleItemDocument = `
    mutation ToggleItem($itemId: ItemId!) {
  toggleItem(itemId: $itemId) {
    __typename
    ... on ToggleItemOutput {
      takenById
      takenAt
    }
  }
}
    `;

export const useToggleItemMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.ToggleItemMutation, TError, Types.ToggleItemMutationVariables, TContext>) => {
    
    return useMutation<Types.ToggleItemMutation, TError, Types.ToggleItemMutationVariables, TContext>(
      {
    mutationKey: ['ToggleItem'],
    mutationFn: (variables?: Types.ToggleItemMutationVariables) => fetchGql<Types.ToggleItemMutation, Types.ToggleItemMutationVariables>(ToggleItemDocument, variables)(),
    ...options
  }
    )};

export const ScanItemUrlDocument = `
    mutation ScanItemUrl($input: ScanItemUrlInput!) {
  scanItemUrl(input: $input) {
    __typename
    ... on ScanItemUrlOutput {
      pictureUrl
    }
  }
}
    `;

export const useScanItemUrlMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.ScanItemUrlMutation, TError, Types.ScanItemUrlMutationVariables, TContext>) => {
    
    return useMutation<Types.ScanItemUrlMutation, TError, Types.ScanItemUrlMutationVariables, TContext>(
      {
    mutationKey: ['ScanItemUrl'],
    mutationFn: (variables?: Types.ScanItemUrlMutationVariables) => fetchGql<Types.ScanItemUrlMutation, Types.ScanItemUrlMutationVariables>(ScanItemUrlDocument, variables)(),
    ...options
  }
    )};

export const ImportItemsDocument = `
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
        takenById
        takenAt
        createdAt
        takerUser {
          id
          firstName
          pictureUrl
        }
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
    `;

export const useImportItemsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.ImportItemsMutation, TError, Types.ImportItemsMutationVariables, TContext>) => {
    
    return useMutation<Types.ImportItemsMutation, TError, Types.ImportItemsMutationVariables, TContext>(
      {
    mutationKey: ['ImportItems'],
    mutationFn: (variables?: Types.ImportItemsMutationVariables) => fetchGql<Types.ImportItemsMutation, Types.ImportItemsMutationVariables>(ImportItemsDocument, variables)(),
    ...options
  }
    )};

export const GetSecretSantaForEventDocument = `
    query GetSecretSantaForEvent($eventId: EventId!) {
  secretSanta(eventId: $eventId) {
    __typename
    ...SecretSantaItem
  }
}
    ${SecretSantaItemFragmentDoc}`;

export const useGetSecretSantaForEventQuery = <
      TData = Types.GetSecretSantaForEventQuery,
      TError = unknown
    >(
      variables: Types.GetSecretSantaForEventQueryVariables,
      options?: Omit<UseQueryOptions<Types.GetSecretSantaForEventQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.GetSecretSantaForEventQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.GetSecretSantaForEventQuery, TError, TData>(
      {
    queryKey: ['GetSecretSantaForEvent', variables],
    queryFn: fetchGql<Types.GetSecretSantaForEventQuery, Types.GetSecretSantaForEventQueryVariables>(GetSecretSantaForEventDocument, variables),
    ...options
  }
    )};

export const GetMySecretSantaDrawDocument = `
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
    `;

export const useGetMySecretSantaDrawQuery = <
      TData = Types.GetMySecretSantaDrawQuery,
      TError = unknown
    >(
      variables: Types.GetMySecretSantaDrawQueryVariables,
      options?: Omit<UseQueryOptions<Types.GetMySecretSantaDrawQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.GetMySecretSantaDrawQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.GetMySecretSantaDrawQuery, TError, TData>(
      {
    queryKey: ['GetMySecretSantaDraw', variables],
    queryFn: fetchGql<Types.GetMySecretSantaDrawQuery, Types.GetMySecretSantaDrawQueryVariables>(GetMySecretSantaDrawDocument, variables),
    ...options
  }
    )};

export const CreateSecretSantaDocument = `
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
    ${SecretSantaItemFragmentDoc}`;

export const useCreateSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.CreateSecretSantaMutation, TError, Types.CreateSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<Types.CreateSecretSantaMutation, TError, Types.CreateSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['CreateSecretSanta'],
    mutationFn: (variables?: Types.CreateSecretSantaMutationVariables) => fetchGql<Types.CreateSecretSantaMutation, Types.CreateSecretSantaMutationVariables>(CreateSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const UpdateSecretSantaDocument = `
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
    `;

export const useUpdateSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateSecretSantaMutation, TError, Types.UpdateSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateSecretSantaMutation, TError, Types.UpdateSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSecretSanta'],
    mutationFn: (variables?: Types.UpdateSecretSantaMutationVariables) => fetchGql<Types.UpdateSecretSantaMutation, Types.UpdateSecretSantaMutationVariables>(UpdateSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const DeleteSecretSantaDocument = `
    mutation DeleteSecretSanta($id: SecretSantaId!) {
  deleteSecretSanta(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useDeleteSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.DeleteSecretSantaMutation, TError, Types.DeleteSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<Types.DeleteSecretSantaMutation, TError, Types.DeleteSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['DeleteSecretSanta'],
    mutationFn: (variables?: Types.DeleteSecretSantaMutationVariables) => fetchGql<Types.DeleteSecretSantaMutation, Types.DeleteSecretSantaMutationVariables>(DeleteSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const StartSecretSantaDocument = `
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
    `;

export const useStartSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.StartSecretSantaMutation, TError, Types.StartSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<Types.StartSecretSantaMutation, TError, Types.StartSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['StartSecretSanta'],
    mutationFn: (variables?: Types.StartSecretSantaMutationVariables) => fetchGql<Types.StartSecretSantaMutation, Types.StartSecretSantaMutationVariables>(StartSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const CancelSecretSantaDocument = `
    mutation CancelSecretSanta($id: SecretSantaId!) {
  cancelSecretSanta(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useCancelSecretSantaMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.CancelSecretSantaMutation, TError, Types.CancelSecretSantaMutationVariables, TContext>) => {
    
    return useMutation<Types.CancelSecretSantaMutation, TError, Types.CancelSecretSantaMutationVariables, TContext>(
      {
    mutationKey: ['CancelSecretSanta'],
    mutationFn: (variables?: Types.CancelSecretSantaMutationVariables) => fetchGql<Types.CancelSecretSantaMutation, Types.CancelSecretSantaMutationVariables>(CancelSecretSantaDocument, variables)(),
    ...options
  }
    )};

export const AddSecretSantaUsersDocument = `
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
    ${SecretSantaUserItemFragmentDoc}`;

export const useAddSecretSantaUsersMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AddSecretSantaUsersMutation, TError, Types.AddSecretSantaUsersMutationVariables, TContext>) => {
    
    return useMutation<Types.AddSecretSantaUsersMutation, TError, Types.AddSecretSantaUsersMutationVariables, TContext>(
      {
    mutationKey: ['AddSecretSantaUsers'],
    mutationFn: (variables?: Types.AddSecretSantaUsersMutationVariables) => fetchGql<Types.AddSecretSantaUsersMutation, Types.AddSecretSantaUsersMutationVariables>(AddSecretSantaUsersDocument, variables)(),
    ...options
  }
    )};

export const UpdateSecretSantaUserDocument = `
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
    `;

export const useUpdateSecretSantaUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateSecretSantaUserMutation, TError, Types.UpdateSecretSantaUserMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateSecretSantaUserMutation, TError, Types.UpdateSecretSantaUserMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSecretSantaUser'],
    mutationFn: (variables?: Types.UpdateSecretSantaUserMutationVariables) => fetchGql<Types.UpdateSecretSantaUserMutation, Types.UpdateSecretSantaUserMutationVariables>(UpdateSecretSantaUserDocument, variables)(),
    ...options
  }
    )};

export const DeleteSecretSantaUserDocument = `
    mutation DeleteSecretSantaUser($id: SecretSantaId!, $secretSantaUserId: SecretSantaUserId!) {
  deleteSecretSantaUser(id: $id, secretSantaUserId: $secretSantaUserId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useDeleteSecretSantaUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.DeleteSecretSantaUserMutation, TError, Types.DeleteSecretSantaUserMutationVariables, TContext>) => {
    
    return useMutation<Types.DeleteSecretSantaUserMutation, TError, Types.DeleteSecretSantaUserMutationVariables, TContext>(
      {
    mutationKey: ['DeleteSecretSantaUser'],
    mutationFn: (variables?: Types.DeleteSecretSantaUserMutationVariables) => fetchGql<Types.DeleteSecretSantaUserMutation, Types.DeleteSecretSantaUserMutationVariables>(DeleteSecretSantaUserDocument, variables)(),
    ...options
  }
    )};

export const AdminUsersListDocument = `
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
    `;

export const useAdminUsersListQuery = <
      TData = Types.AdminUsersListQuery,
      TError = unknown
    >(
      variables?: Types.AdminUsersListQueryVariables,
      options?: Omit<UseQueryOptions<Types.AdminUsersListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.AdminUsersListQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.AdminUsersListQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['AdminUsersList'] : ['AdminUsersList', variables],
    queryFn: fetchGql<Types.AdminUsersListQuery, Types.AdminUsersListQueryVariables>(AdminUsersListDocument, variables),
    ...options
  }
    )};

export const AdminUserDetailDocument = `
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
    }
  }
}
    `;

export const useAdminUserDetailQuery = <
      TData = Types.AdminUserDetailQuery,
      TError = unknown
    >(
      variables: Types.AdminUserDetailQueryVariables,
      options?: Omit<UseQueryOptions<Types.AdminUserDetailQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.AdminUserDetailQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.AdminUserDetailQuery, TError, TData>(
      {
    queryKey: ['AdminUserDetail', variables],
    queryFn: fetchGql<Types.AdminUserDetailQuery, Types.AdminUserDetailQueryVariables>(AdminUserDetailDocument, variables),
    ...options
  }
    )};

export const AdminUpdateUserProfileDocument = `
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
    `;

export const useAdminUpdateUserProfileMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AdminUpdateUserProfileMutation, TError, Types.AdminUpdateUserProfileMutationVariables, TContext>) => {
    
    return useMutation<Types.AdminUpdateUserProfileMutation, TError, Types.AdminUpdateUserProfileMutationVariables, TContext>(
      {
    mutationKey: ['AdminUpdateUserProfile'],
    mutationFn: (variables?: Types.AdminUpdateUserProfileMutationVariables) => fetchGql<Types.AdminUpdateUserProfileMutation, Types.AdminUpdateUserProfileMutationVariables>(AdminUpdateUserProfileDocument, variables)(),
    ...options
  }
    )};

export const AdminDeleteUserDocument = `
    mutation AdminDeleteUser($userId: UserId!) {
  adminDeleteUser(userId: $userId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useAdminDeleteUserMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AdminDeleteUserMutation, TError, Types.AdminDeleteUserMutationVariables, TContext>) => {
    
    return useMutation<Types.AdminDeleteUserMutation, TError, Types.AdminDeleteUserMutationVariables, TContext>(
      {
    mutationKey: ['AdminDeleteUser'],
    mutationFn: (variables?: Types.AdminDeleteUserMutationVariables) => fetchGql<Types.AdminDeleteUserMutation, Types.AdminDeleteUserMutationVariables>(AdminDeleteUserDocument, variables)(),
    ...options
  }
    )};

export const AdminRemoveUserPictureDocument = `
    mutation AdminRemoveUserPicture($userId: UserId!) {
  adminRemoveUserPicture(userId: $userId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useAdminRemoveUserPictureMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AdminRemoveUserPictureMutation, TError, Types.AdminRemoveUserPictureMutationVariables, TContext>) => {
    
    return useMutation<Types.AdminRemoveUserPictureMutation, TError, Types.AdminRemoveUserPictureMutationVariables, TContext>(
      {
    mutationKey: ['AdminRemoveUserPicture'],
    mutationFn: (variables?: Types.AdminRemoveUserPictureMutationVariables) => fetchGql<Types.AdminRemoveUserPictureMutation, Types.AdminRemoveUserPictureMutationVariables>(AdminRemoveUserPictureDocument, variables)(),
    ...options
  }
    )};

export const UserProfileCurrentUserDocument = `
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
      socials {
        id
        socialType
        name
        email
        pictureUrl
        createdAt
        updatedAt
      }
    }
  }
}
    `;

export const useUserProfileCurrentUserQuery = <
      TData = Types.UserProfileCurrentUserQuery,
      TError = unknown
    >(
      variables?: Types.UserProfileCurrentUserQueryVariables,
      options?: Omit<UseQueryOptions<Types.UserProfileCurrentUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.UserProfileCurrentUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.UserProfileCurrentUserQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserProfileCurrentUser'] : ['UserProfileCurrentUser', variables],
    queryFn: fetchGql<Types.UserProfileCurrentUserQuery, Types.UserProfileCurrentUserQueryVariables>(UserProfileCurrentUserDocument, variables),
    ...options
  }
    )};

export const UserProfileEmailSettingsDocument = `
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
    `;

export const useUserProfileEmailSettingsQuery = <
      TData = Types.UserProfileEmailSettingsQuery,
      TError = unknown
    >(
      variables?: Types.UserProfileEmailSettingsQueryVariables,
      options?: Omit<UseQueryOptions<Types.UserProfileEmailSettingsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.UserProfileEmailSettingsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.UserProfileEmailSettingsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserProfileEmailSettings'] : ['UserProfileEmailSettings', variables],
    queryFn: fetchGql<Types.UserProfileEmailSettingsQuery, Types.UserProfileEmailSettingsQueryVariables>(UserProfileEmailSettingsDocument, variables),
    ...options
  }
    )};

export const UserPendingEmailChangeDocument = `
    query UserPendingEmailChange {
  pendingEmailChange {
    __typename
    ... on PendingEmailChange {
      newEmail
      expiredAt
    }
  }
}
    `;

export const useUserPendingEmailChangeQuery = <
      TData = Types.UserPendingEmailChangeQuery,
      TError = unknown
    >(
      variables?: Types.UserPendingEmailChangeQueryVariables,
      options?: Omit<UseQueryOptions<Types.UserPendingEmailChangeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.UserPendingEmailChangeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.UserPendingEmailChangeQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserPendingEmailChange'] : ['UserPendingEmailChange', variables],
    queryFn: fetchGql<Types.UserPendingEmailChangeQuery, Types.UserPendingEmailChangeQueryVariables>(UserPendingEmailChangeDocument, variables),
    ...options
  }
    )};

export const SearchUsersSelectDocument = `
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
    `;

export const useSearchUsersSelectQuery = <
      TData = Types.SearchUsersSelectQuery,
      TError = unknown
    >(
      variables: Types.SearchUsersSelectQueryVariables,
      options?: Omit<UseQueryOptions<Types.SearchUsersSelectQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.SearchUsersSelectQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.SearchUsersSelectQuery, TError, TData>(
      {
    queryKey: ['SearchUsersSelect', variables],
    queryFn: fetchGql<Types.SearchUsersSelectQuery, Types.SearchUsersSelectQueryVariables>(SearchUsersSelectDocument, variables),
    ...options
  }
    )};

export const UserClosestFriendsDocument = `
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
    `;

export const useUserClosestFriendsQuery = <
      TData = Types.UserClosestFriendsQuery,
      TError = unknown
    >(
      variables?: Types.UserClosestFriendsQueryVariables,
      options?: Omit<UseQueryOptions<Types.UserClosestFriendsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.UserClosestFriendsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.UserClosestFriendsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserClosestFriends'] : ['UserClosestFriends', variables],
    queryFn: fetchGql<Types.UserClosestFriendsQuery, Types.UserClosestFriendsQueryVariables>(UserClosestFriendsDocument, variables),
    ...options
  }
    )};

export const UpdateUserProfileDocument = `
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
    `;

export const useUpdateUserProfileMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateUserProfileMutation, TError, Types.UpdateUserProfileMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateUserProfileMutation, TError, Types.UpdateUserProfileMutationVariables, TContext>(
      {
    mutationKey: ['UpdateUserProfile'],
    mutationFn: (variables?: Types.UpdateUserProfileMutationVariables) => fetchGql<Types.UpdateUserProfileMutation, Types.UpdateUserProfileMutationVariables>(UpdateUserProfileDocument, variables)(),
    ...options
  }
    )};

export const ChangeUserPasswordDocument = `
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
  }
}
    `;

export const useChangeUserPasswordMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.ChangeUserPasswordMutation, TError, Types.ChangeUserPasswordMutationVariables, TContext>) => {
    
    return useMutation<Types.ChangeUserPasswordMutation, TError, Types.ChangeUserPasswordMutationVariables, TContext>(
      {
    mutationKey: ['ChangeUserPassword'],
    mutationFn: (variables?: Types.ChangeUserPasswordMutationVariables) => fetchGql<Types.ChangeUserPasswordMutation, Types.ChangeUserPasswordMutationVariables>(ChangeUserPasswordDocument, variables)(),
    ...options
  }
    )};

export const UpdateUserEmailSettingsDocument = `
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
    `;

export const useUpdateUserEmailSettingsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateUserEmailSettingsMutation, TError, Types.UpdateUserEmailSettingsMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateUserEmailSettingsMutation, TError, Types.UpdateUserEmailSettingsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateUserEmailSettings'],
    mutationFn: (variables?: Types.UpdateUserEmailSettingsMutationVariables) => fetchGql<Types.UpdateUserEmailSettingsMutation, Types.UpdateUserEmailSettingsMutationVariables>(UpdateUserEmailSettingsDocument, variables)(),
    ...options
  }
    )};

export const LinkCurrentUserWithGoogleDocument = `
    mutation LinkCurrentUserWithGoogle($input: LinkUserToGoogleInput!) {
  linkCurrentUserWithGoogle(input: $input) {
    __typename
    ... on UserSocial {
      id
      socialType
      name
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
    `;

export const useLinkCurrentUserWithGoogleMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.LinkCurrentUserWithGoogleMutation, TError, Types.LinkCurrentUserWithGoogleMutationVariables, TContext>) => {
    
    return useMutation<Types.LinkCurrentUserWithGoogleMutation, TError, Types.LinkCurrentUserWithGoogleMutationVariables, TContext>(
      {
    mutationKey: ['LinkCurrentUserWithGoogle'],
    mutationFn: (variables?: Types.LinkCurrentUserWithGoogleMutationVariables) => fetchGql<Types.LinkCurrentUserWithGoogleMutation, Types.LinkCurrentUserWithGoogleMutationVariables>(LinkCurrentUserWithGoogleDocument, variables)(),
    ...options
  }
    )};

export const UnlinkCurrentUserSocialDocument = `
    mutation UnlinkCurrentUserSocial($socialId: UserSocialId!) {
  unlinkCurrentUserSocial(socialId: $socialId) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useUnlinkCurrentUserSocialMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UnlinkCurrentUserSocialMutation, TError, Types.UnlinkCurrentUserSocialMutationVariables, TContext>) => {
    
    return useMutation<Types.UnlinkCurrentUserSocialMutation, TError, Types.UnlinkCurrentUserSocialMutationVariables, TContext>(
      {
    mutationKey: ['UnlinkCurrentUserSocial'],
    mutationFn: (variables?: Types.UnlinkCurrentUserSocialMutationVariables) => fetchGql<Types.UnlinkCurrentUserSocialMutation, Types.UnlinkCurrentUserSocialMutationVariables>(UnlinkCurrentUserSocialDocument, variables)(),
    ...options
  }
    )};

export const UpdateUserPictureFromSocialDocument = `
    mutation UpdateUserPictureFromSocial($input: UpdateUserPictureFromSocialInput!) {
  updateUserPictureFromSocial(input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useUpdateUserPictureFromSocialMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateUserPictureFromSocialMutation, TError, Types.UpdateUserPictureFromSocialMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateUserPictureFromSocialMutation, TError, Types.UpdateUserPictureFromSocialMutationVariables, TContext>(
      {
    mutationKey: ['UpdateUserPictureFromSocial'],
    mutationFn: (variables?: Types.UpdateUserPictureFromSocialMutationVariables) => fetchGql<Types.UpdateUserPictureFromSocialMutation, Types.UpdateUserPictureFromSocialMutationVariables>(UpdateUserPictureFromSocialDocument, variables)(),
    ...options
  }
    )};

export const RemoveCurrentUserPictureDocument = `
    mutation RemoveCurrentUserPicture {
  removeUserPicture {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useRemoveCurrentUserPictureMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.RemoveCurrentUserPictureMutation, TError, Types.RemoveCurrentUserPictureMutationVariables, TContext>) => {
    
    return useMutation<Types.RemoveCurrentUserPictureMutation, TError, Types.RemoveCurrentUserPictureMutationVariables, TContext>(
      {
    mutationKey: ['RemoveCurrentUserPicture'],
    mutationFn: (variables?: Types.RemoveCurrentUserPictureMutationVariables) => fetchGql<Types.RemoveCurrentUserPictureMutation, Types.RemoveCurrentUserPictureMutationVariables>(RemoveCurrentUserPictureDocument, variables)(),
    ...options
  }
    )};

export const RequestUserEmailChangeDocument = `
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
    `;

export const useRequestUserEmailChangeMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.RequestUserEmailChangeMutation, TError, Types.RequestUserEmailChangeMutationVariables, TContext>) => {
    
    return useMutation<Types.RequestUserEmailChangeMutation, TError, Types.RequestUserEmailChangeMutationVariables, TContext>(
      {
    mutationKey: ['RequestUserEmailChange'],
    mutationFn: (variables?: Types.RequestUserEmailChangeMutationVariables) => fetchGql<Types.RequestUserEmailChangeMutation, Types.RequestUserEmailChangeMutationVariables>(RequestUserEmailChangeDocument, variables)(),
    ...options
  }
    )};

export const WishlistListPageDocument = `
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
    `;

export const useWishlistListPageQuery = <
      TData = Types.WishlistListPageQuery,
      TError = unknown
    >(
      variables: Types.WishlistListPageQueryVariables,
      options?: Omit<UseQueryOptions<Types.WishlistListPageQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.WishlistListPageQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.WishlistListPageQuery, TError, TData>(
      {
    queryKey: ['WishlistListPage', variables],
    queryFn: fetchGql<Types.WishlistListPageQuery, Types.WishlistListPageQueryVariables>(WishlistListPageDocument, variables),
    ...options
  }
    )};

export const UpdateWishlistDocument = `
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
    `;

export const useUpdateWishlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateWishlistMutation, TError, Types.UpdateWishlistMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateWishlistMutation, TError, Types.UpdateWishlistMutationVariables, TContext>(
      {
    mutationKey: ['UpdateWishlist'],
    mutationFn: (variables?: Types.UpdateWishlistMutationVariables) => fetchGql<Types.UpdateWishlistMutation, Types.UpdateWishlistMutationVariables>(UpdateWishlistDocument, variables)(),
    ...options
  }
    )};

export const DeleteWishlistDocument = `
    mutation DeleteWishlist($id: WishlistId!) {
  deleteWishlist(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useDeleteWishlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.DeleteWishlistMutation, TError, Types.DeleteWishlistMutationVariables, TContext>) => {
    
    return useMutation<Types.DeleteWishlistMutation, TError, Types.DeleteWishlistMutationVariables, TContext>(
      {
    mutationKey: ['DeleteWishlist'],
    mutationFn: (variables?: Types.DeleteWishlistMutationVariables) => fetchGql<Types.DeleteWishlistMutation, Types.DeleteWishlistMutationVariables>(DeleteWishlistDocument, variables)(),
    ...options
  }
    )};

export const LinkWishlistToEventDocument = `
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
    `;

export const useLinkWishlistToEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.LinkWishlistToEventMutation, TError, Types.LinkWishlistToEventMutationVariables, TContext>) => {
    
    return useMutation<Types.LinkWishlistToEventMutation, TError, Types.LinkWishlistToEventMutationVariables, TContext>(
      {
    mutationKey: ['LinkWishlistToEvent'],
    mutationFn: (variables?: Types.LinkWishlistToEventMutationVariables) => fetchGql<Types.LinkWishlistToEventMutation, Types.LinkWishlistToEventMutationVariables>(LinkWishlistToEventDocument, variables)(),
    ...options
  }
    )};

export const UnlinkWishlistFromEventDocument = `
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
    `;

export const useUnlinkWishlistFromEventMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UnlinkWishlistFromEventMutation, TError, Types.UnlinkWishlistFromEventMutationVariables, TContext>) => {
    
    return useMutation<Types.UnlinkWishlistFromEventMutation, TError, Types.UnlinkWishlistFromEventMutationVariables, TContext>(
      {
    mutationKey: ['UnlinkWishlistFromEvent'],
    mutationFn: (variables?: Types.UnlinkWishlistFromEventMutationVariables) => fetchGql<Types.UnlinkWishlistFromEventMutation, Types.UnlinkWishlistFromEventMutationVariables>(UnlinkWishlistFromEventDocument, variables)(),
    ...options
  }
    )};

export const AddWishlistCoOwnerDocument = `
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
    `;

export const useAddWishlistCoOwnerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.AddWishlistCoOwnerMutation, TError, Types.AddWishlistCoOwnerMutationVariables, TContext>) => {
    
    return useMutation<Types.AddWishlistCoOwnerMutation, TError, Types.AddWishlistCoOwnerMutationVariables, TContext>(
      {
    mutationKey: ['AddWishlistCoOwner'],
    mutationFn: (variables?: Types.AddWishlistCoOwnerMutationVariables) => fetchGql<Types.AddWishlistCoOwnerMutation, Types.AddWishlistCoOwnerMutationVariables>(AddWishlistCoOwnerDocument, variables)(),
    ...options
  }
    )};

export const RemoveWishlistCoOwnerDocument = `
    mutation RemoveWishlistCoOwner($id: WishlistId!) {
  removeWishlistCoOwner(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useRemoveWishlistCoOwnerMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.RemoveWishlistCoOwnerMutation, TError, Types.RemoveWishlistCoOwnerMutationVariables, TContext>) => {
    
    return useMutation<Types.RemoveWishlistCoOwnerMutation, TError, Types.RemoveWishlistCoOwnerMutationVariables, TContext>(
      {
    mutationKey: ['RemoveWishlistCoOwner'],
    mutationFn: (variables?: Types.RemoveWishlistCoOwnerMutationVariables) => fetchGql<Types.RemoveWishlistCoOwnerMutation, Types.RemoveWishlistCoOwnerMutationVariables>(RemoveWishlistCoOwnerDocument, variables)(),
    ...options
  }
    )};

export const RemoveWishlistLogoDocument = `
    mutation RemoveWishlistLogo($id: WishlistId!) {
  removeWishlistLogo(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useRemoveWishlistLogoMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.RemoveWishlistLogoMutation, TError, Types.RemoveWishlistLogoMutationVariables, TContext>) => {
    
    return useMutation<Types.RemoveWishlistLogoMutation, TError, Types.RemoveWishlistLogoMutationVariables, TContext>(
      {
    mutationKey: ['RemoveWishlistLogo'],
    mutationFn: (variables?: Types.RemoveWishlistLogoMutationVariables) => fetchGql<Types.RemoveWishlistLogoMutation, Types.RemoveWishlistLogoMutationVariables>(RemoveWishlistLogoDocument, variables)(),
    ...options
  }
    )};

export const WishlistPageDocument = `
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
        takenById
        takenAt
        createdAt
        takerUser {
          id
          firstName
          pictureUrl
        }
      }
      createdAt
      updatedAt
    }
    ... on NotFoundRejection {
      __typename
    }
  }
}
    `;

export const useWishlistPageQuery = <
      TData = Types.WishlistPageQuery,
      TError = unknown
    >(
      variables: Types.WishlistPageQueryVariables,
      options?: Omit<UseQueryOptions<Types.WishlistPageQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.WishlistPageQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.WishlistPageQuery, TError, TData>(
      {
    queryKey: ['WishlistPage', variables],
    queryFn: fetchGql<Types.WishlistPageQuery, Types.WishlistPageQueryVariables>(WishlistPageDocument, variables),
    ...options
  }
    )};

export const AdminListWishlistsForUserDocument = `
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
    `;

export const useAdminListWishlistsForUserQuery = <
      TData = Types.AdminListWishlistsForUserQuery,
      TError = unknown
    >(
      variables: Types.AdminListWishlistsForUserQueryVariables,
      options?: Omit<UseQueryOptions<Types.AdminListWishlistsForUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.AdminListWishlistsForUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.AdminListWishlistsForUserQuery, TError, TData>(
      {
    queryKey: ['AdminListWishlistsForUser', variables],
    queryFn: fetchGql<Types.AdminListWishlistsForUserQuery, Types.AdminListWishlistsForUserQueryVariables>(AdminListWishlistsForUserDocument, variables),
    ...options
  }
    )};
