import type { EventListPageGetEventsQuery, EventPageGetEventQuery } from '../../gql'

/**
 * The Event success member of the EventPage query, used as the canonical
 * shape passed around the event feature components.
 */
export type EventDetail = Extract<EventPageGetEventQuery['event'], { __typename: 'Event' }>

export type EventAttendee = EventDetail['attendees'][number]

export type EventWishlist = EventDetail['wishlists'][number]

/**
 * A single event row from the paginated EventListPage query.
 */
export type EventListItem = Extract<
  EventListPageGetEventsQuery['events'],
  { __typename: 'GetEventsPagedResponse' }
>['data'][number]
