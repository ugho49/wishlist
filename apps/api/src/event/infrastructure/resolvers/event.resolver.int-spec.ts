import type { RequestApp } from '@wishlist/api-test-utils'

import { BASE_USER_EMAIL, Factories, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

describe('EventResolver (GraphQL)', () => {
  const { getRequest, getFactories } = useTestApp()
  let factories: Factories
  let request: RequestApp
  let currentUserId: string

  beforeEach(async () => {
    factories = getFactories()
    request = await getRequest({ signedAs: 'BASE_USER' })
    currentUserId = await factories.getSignedUserId('BASE_USER')
  })

  describe('Query event', () => {
    const query = /* GraphQL */ `
      query GetEventById($id: EventId!) {
        event(id: $id) {
          __typename
          ... on Event {
            id
            title
            description
            eventDate
            wishlistIds
            attendeeIds
            createdAt
            updatedAt
          }
          ... on NotFoundRejection {
            message
          }
          ... on UnauthorizedRejection {
            message
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthRequest = await getRequest()
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })

      const res = await unauthRequest
        .post('/graphql')
        .send({ query, variables: { id: eventId } })
        .expect(200)

      expect(res.body.data?.event?.__typename).not.toBe('Event')
    })

    it('should return the event when user is a participant', async () => {
      const eventDate = DateTime.now().plus({ days: 30 }).toJSDate()
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Christmas',
        description: 'A nice event',
        eventDate,
        maintainerId: currentUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: eventId } })
        .expect(200)

      expect(res.body.data.event).toMatchObject({
        __typename: 'Event',
        id: eventId,
        title: 'Christmas',
        description: 'A nice event',
        eventDate: expect.any(String),
      })
      expect(res.body.data.event.attendeeIds).toHaveLength(1)
      expect(res.body.data.event.createdAt).toEqual(expect.any(String))
      expect(res.body.data.event.updatedAt).toEqual(expect.any(String))
    })

    it('should return NotFoundRejection when event does not exist', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data.event).toMatchObject({
        __typename: 'NotFoundRejection',
      })
    })

    it('should return NotFoundRejection when user is not part of the event', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Private event',
        maintainerId: otherUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: eventId } })
        .expect(200)

      expect(res.body.data.event).toMatchObject({
        __typename: 'NotFoundRejection',
      })
    })

    describe('nested field resolvers', () => {
      const nestedQuery = /* GraphQL */ `
        query GetEventByIdNested($id: EventId!) {
          event(id: $id) {
            __typename
            ... on Event {
              id
              wishlists {
                id
                title
                description
              }
              attendees {
                id
                role
                user {
                  id
                  email
                  firstName
                  lastName
                }
              }
            }
          }
        }
      `

      it('should resolve nested wishlists, attendees and attendee.user', async () => {
        const eventDate = DateTime.now().plus({ days: 30 }).toJSDate()
        const {
          event: { id: eventId },
          attendee: { id: attendeeId },
        } = await factories.event.createWithMaintainer({
          title: 'Event with relations',
          eventDate,
          maintainerId: currentUserId,
        })

        const {
          user: { id: secondUserId },
          attendee: { id: secondAttendeeId },
        } = await factories.user.createAndJoinEvent({
          email: 'guest@test.fr',
          firstName: 'Guest',
          lastName: 'Person',
          eventId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'My wishlist',
          description: 'Wishlist description',
          hideItems: false,
        })

        const res = await request
          .post('/graphql')
          .send({ query: nestedQuery, variables: { id: eventId } })
          .expect(200)

        const event = res.body.data.event
        expect(event.__typename).toBe('Event')
        expect(event.id).toBe(eventId)

        expect(event.wishlists).toHaveLength(1)
        expect(event.wishlists[0]).toMatchObject({
          id: wishlistId,
          title: 'My wishlist',
          description: 'Wishlist description',
        })

        expect(event.attendees).toHaveLength(2)
        const attendeeIds = event.attendees.map((a: { id: string }) => a.id)
        expect(attendeeIds).toEqual(expect.arrayContaining([attendeeId, secondAttendeeId]))

        const maintainerAttendee = event.attendees.find((a: { id: string }) => a.id === attendeeId)
        expect(maintainerAttendee).toMatchObject({
          role: 'MAINTAINER',
          user: {
            id: currentUserId,
            email: BASE_USER_EMAIL,
          },
        })

        const guestAttendee = event.attendees.find((a: { id: string }) => a.id === secondAttendeeId)
        expect(guestAttendee).toMatchObject({
          role: 'USER',
          user: {
            id: secondUserId,
            email: 'guest@test.fr',
            firstName: 'Guest',
            lastName: 'Person',
          },
        })
      })

      it('should resolve empty arrays when event has no wishlists', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Empty event',
          maintainerId: currentUserId,
        })

        const res = await request
          .post('/graphql')
          .send({ query: nestedQuery, variables: { id: eventId } })
          .expect(200)

        const event = res.body.data.event
        expect(event.__typename).toBe('Event')
        expect(event.wishlists).toEqual([])
        expect(event.attendees).toHaveLength(1)
      })
    })
  })

  describe('Query events', () => {
    const query = /* GraphQL */ `
      query GetMyEvents($filters: EventPaginationFilters!) {
        events(filters: $filters) {
          __typename
          ... on GetEventsPagedResponse {
            data {
              id
              title
            }
            pagination {
              totalPages
              totalElements
              pageNumber
              pageSize
            }
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthRequest = await getRequest()

      const res = await unauthRequest
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expect(res.body.data?.events?.__typename).not.toBe('GetEventsPagedResponse')
    })

    it('should return only events the current user participates in', async () => {
      const {
        event: { id: myEventId },
      } = await factories.event.createWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })

      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })
      await factories.event.createWithMaintainer({
        title: 'Not my event',
        maintainerId: otherUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      const result = res.body.data.events
      expect(result.__typename).toBe('GetEventsPagedResponse')
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({ id: myEventId, title: 'My event' })
      expect(result.pagination).toMatchObject({
        totalElements: 1,
        totalPages: 1,
        pageNumber: 1,
      })
    })

    it('should paginate results using filters { page, limit }', async () => {
      for (let i = 0; i < 3; i++) {
        await factories.event.createWithMaintainer({
          title: `Event ${i}`,
          eventDate: DateTime.now()
            .plus({ days: i + 1 })
            .toJSDate(),
          maintainerId: currentUserId,
        })
      }

      const firstPage = await request
        .post('/graphql')
        .send({ query, variables: { filters: { page: 1, limit: 2 } } })
        .expect(200)

      expect(firstPage.body.data.events).toMatchObject({
        __typename: 'GetEventsPagedResponse',
        pagination: {
          totalElements: 3,
          totalPages: 2,
          pageNumber: 1,
          pageSize: 2,
        },
      })
      expect(firstPage.body.data.events.data).toHaveLength(2)

      const secondPage = await request
        .post('/graphql')
        .send({ query, variables: { filters: { page: 2, limit: 2 } } })
        .expect(200)

      expect(secondPage.body.data.events).toMatchObject({
        __typename: 'GetEventsPagedResponse',
        pagination: {
          totalElements: 3,
          totalPages: 2,
          pageNumber: 2,
          pageSize: 2,
        },
      })
      expect(secondPage.body.data.events.data).toHaveLength(1)

      const firstPageIds = firstPage.body.data.events.data.map((e: { id: string }) => e.id)
      const secondPageIds = secondPage.body.data.events.data.map((e: { id: string }) => e.id)
      expect(firstPageIds).not.toEqual(expect.arrayContaining(secondPageIds))
    })

    it('should return an empty paged response when user has no events', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expect(res.body.data.events).toMatchObject({
        __typename: 'GetEventsPagedResponse',
        data: [],
        pagination: {
          totalElements: 0,
          totalPages: 0,
          pageNumber: 1,
        },
      })
    })
  })
})
