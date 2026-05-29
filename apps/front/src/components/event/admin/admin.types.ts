import type { AdminEventGetEventQuery, AdminEventListEventsQuery } from '../../../gql'

export type AdminEventListItem = Extract<
  AdminEventListEventsQuery['adminEvents'],
  { __typename: 'GetEventsPagedResponse' }
>['data'][number]

export type AdminEventDetail = Extract<AdminEventGetEventQuery['adminEvent'], { __typename: 'Event' }>

export type AdminEventAttendee = AdminEventDetail['attendees'][number]

export type AdminEventWishlist = AdminEventDetail['wishlists'][number]
