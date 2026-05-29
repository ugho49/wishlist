import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

describe('EventResolver (GraphQL)', () => {
  const { getRequest, getFixtures } = useTestApp()
  let fixtures: Fixtures
  let request: RequestApp
  let currentUserId: string

  beforeEach(async () => {
    fixtures = getFixtures()
    request = await getRequest({ signedAs: 'BASE_USER' })
    currentUserId = await fixtures.getSignedUserId('BASE_USER')
  })

  describe('Query getEventById', () => {
    const query = /* GraphQL */ `
      query GetEventById($id: EventId!) {
        getEventById(id: $id) {
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
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })

      const res = await unauthRequest
        .post('/graphql')
        .send({ query, variables: { id: eventId } })
        .expect(200)

      expect(res.body.data?.getEventById?.__typename).not.toBe('Event')
    })

    it('should return the event when user is a participant', async () => {
      const eventDate = DateTime.now().plus({ days: 30 }).toJSDate()
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Christmas',
        description: 'A nice event',
        eventDate,
        maintainerId: currentUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: eventId } })
        .expect(200)

      expect(res.body.data.getEventById).toMatchObject({
        __typename: 'Event',
        id: eventId,
        title: 'Christmas',
        description: 'A nice event',
        eventDate: expect.any(String),
      })
      expect(res.body.data.getEventById.attendeeIds).toHaveLength(1)
      expect(res.body.data.getEventById.createdAt).toEqual(expect.any(String))
      expect(res.body.data.getEventById.updatedAt).toEqual(expect.any(String))
    })

    it('should return NotFoundRejection when event does not exist', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data.getEventById).toMatchObject({
        __typename: 'NotFoundRejection',
      })
    })

    it('should return NotFoundRejection when user is not part of the event', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Private event',
        maintainerId: otherUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: eventId } })
        .expect(200)

      expect(res.body.data.getEventById).toMatchObject({
        __typename: 'NotFoundRejection',
      })
    })

    describe('nested field resolvers', () => {
      const nestedQuery = /* GraphQL */ `
        query GetEventByIdNested($id: EventId!) {
          getEventById(id: $id) {
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
        const { eventId, attendeeId } = await fixtures.insertEventWithMaintainer({
          title: 'Event with relations',
          eventDate,
          maintainerId: currentUserId,
        })

        const { userId: secondUserId, attendeeId: secondAttendeeId } =
          await fixtures.insertUserAndAddItToEventAsAttendee({
            email: 'guest@test.fr',
            firstname: 'Guest',
            lastname: 'Person',
            eventId,
          })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My wishlist',
          description: 'Wishlist description',
          hideItems: false,
        })

        const res = await request
          .post('/graphql')
          .send({ query: nestedQuery, variables: { id: eventId } })
          .expect(200)

        const event = res.body.data.getEventById
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
            email: Fixtures.BASE_USER_EMAIL,
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
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Empty event',
          maintainerId: currentUserId,
        })

        const res = await request
          .post('/graphql')
          .send({ query: nestedQuery, variables: { id: eventId } })
          .expect(200)

        const event = res.body.data.getEventById
        expect(event.__typename).toBe('Event')
        expect(event.wishlists).toEqual([])
        expect(event.attendees).toHaveLength(1)
      })
    })
  })

  describe('Query getMyEvents', () => {
    const query = /* GraphQL */ `
      query GetMyEvents($filters: EventPaginationFilters!) {
        getMyEvents(filters: $filters) {
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

      expect(res.body.data?.getMyEvents?.__typename).not.toBe('GetEventsPagedResponse')
    })

    it('should return only events the current user participates in', async () => {
      const { eventId: myEventId } = await fixtures.insertEventWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })

      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })
      await fixtures.insertEventWithMaintainer({
        title: 'Not my event',
        maintainerId: otherUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      const result = res.body.data.getMyEvents
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
        await fixtures.insertEventWithMaintainer({
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

      expect(firstPage.body.data.getMyEvents).toMatchObject({
        __typename: 'GetEventsPagedResponse',
        pagination: {
          totalElements: 3,
          totalPages: 2,
          pageNumber: 1,
          pageSize: 2,
        },
      })
      expect(firstPage.body.data.getMyEvents.data).toHaveLength(2)

      const secondPage = await request
        .post('/graphql')
        .send({ query, variables: { filters: { page: 2, limit: 2 } } })
        .expect(200)

      expect(secondPage.body.data.getMyEvents).toMatchObject({
        __typename: 'GetEventsPagedResponse',
        pagination: {
          totalElements: 3,
          totalPages: 2,
          pageNumber: 2,
          pageSize: 2,
        },
      })
      expect(secondPage.body.data.getMyEvents.data).toHaveLength(1)

      const firstPageIds = firstPage.body.data.getMyEvents.data.map((e: { id: string }) => e.id)
      const secondPageIds = secondPage.body.data.getMyEvents.data.map((e: { id: string }) => e.id)
      expect(firstPageIds).not.toEqual(expect.arrayContaining(secondPageIds))
    })

    it('should return an empty paged response when user has no events', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expect(res.body.data.getMyEvents).toMatchObject({
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
