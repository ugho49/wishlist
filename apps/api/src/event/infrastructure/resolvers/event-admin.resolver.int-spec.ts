import type { RequestApp } from '@wishlist/api-test-utils'

import { Factories, Tables, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

/**
 * Integration tests for the GraphQL EventAdminResolver (@IsAdmin()).
 *
 * GraphQL always returns HTTP 200; thrown Nest exceptions map to typed
 * rejections placed at data.<field>. Non-admin users are rejected by the admin
 * guard (ForbiddenRejection).
 */
const GRAPHQL_PATH = '/graphql'

const futureDate = () => DateTime.now().plus({ days: 30 }).toISODate() as string

describe('EventAdminResolver (GraphQL)', () => {
  const { getRequest, getFactories, expectTable } = useTestApp()
  let factories: Factories

  beforeEach(() => {
    factories = getFactories()
  })

  describe('Query adminEvent', () => {
    const query = /* GraphQL */ `
      query AdminEvent($id: EventId!) {
        adminEvent(id: $id) {
          __typename
          ... on Event {
            id
            title
          }
          ... on ForbiddenRejection {
            message
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when unauthenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data?.adminEvent?.__typename).not.toBe('Event')
    })

    it('should reject with ForbiddenRejection for a non-admin user', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const currentUserId = await factories.getSignedUserId('BASE_USER')
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({ title: 'Event', maintainerId: currentUserId })

      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { id: eventId } })
        .expect(200)

      expect(res.body.data.adminEvent.__typename).toBe('ForbiddenRejection')
    })

    describe('when user is admin', () => {
      let request: RequestApp

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it('should return any event (even one the admin does not own)', async () => {
        const { id: ownerId } = await factories.user.create({ email: 'owner@test.com', firstName: 'O', lastName: 'W' })
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({ title: 'Owned', maintainerId: ownerId })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { id: eventId } })
          .expect(200)

        expect(res.body.data.adminEvent).toMatchObject({ __typename: 'Event', id: eventId, title: 'Owned' })
      })

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { id: uuid() } })
          .expect(200)

        expect(res.body.data.adminEvent.__typename).toBe('NotFoundRejection')
      })
    })
  })

  describe('Query adminEvents', () => {
    const query = /* GraphQL */ `
      query AdminEvents($filters: AdminEventPaginationFilters!) {
        adminEvents(filters: $filters) {
          __typename
          ... on GetEventsPagedResponse {
            data {
              id
              title
            }
            pagination {
              totalElements
              pageNumber
              pageSize
            }
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should reject with ForbiddenRejection for a non-admin user', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expect(res.body.data.adminEvents.__typename).toBe('ForbiddenRejection')
    })

    describe('when user is admin', () => {
      let request: RequestApp

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it('should return all events paginated', async () => {
        const { id: ownerId } = await factories.user.create({ email: 'owner@test.com', firstName: 'O', lastName: 'W' })
        await factories.event.createWithMaintainer({ title: 'Event A', maintainerId: ownerId })
        await factories.event.createWithMaintainer({ title: 'Event B', maintainerId: ownerId })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: {} } })
          .expect(200)

        expect(res.body.data.adminEvents.__typename).toBe('GetEventsPagedResponse')
        expect(res.body.data.adminEvents.data.length).toBeGreaterThanOrEqual(2)
        expect(res.body.data.adminEvents.pagination.totalElements).toBeGreaterThanOrEqual(2)
      })

      it('should filter events by userId', async () => {
        const { id: targetUserId } = await factories.user.create({
          email: 'target@test.com',
          firstName: 'T',
          lastName: 'U',
        })
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'O',
          lastName: 'U',
        })
        const {
          event: { id: targetEventId },
        } = await factories.event.createWithMaintainer({
          title: 'Target Event',
          maintainerId: targetUserId,
        })
        await factories.event.createWithMaintainer({ title: 'Other Event', maintainerId: otherUserId })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId } } })
          .expect(200)

        expect(res.body.data.adminEvents.__typename).toBe('GetEventsPagedResponse')
        expect(res.body.data.adminEvents.data).toEqual([
          expect.objectContaining({ id: targetEventId, title: 'Target Event' }),
        ])
      })
    })
  })

  describe('Mutation adminUpdateEvent', () => {
    const mutation = /* GraphQL */ `
      mutation AdminUpdateEvent($id: EventId!, $input: UpdateEventInput!) {
        adminUpdateEvent(id: $id, input: $input) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should reject with ForbiddenRejection for a non-admin user', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid(), input: { title: 'X', eventDate: futureDate() } } })
        .expect(200)

      expect(res.body.data.adminUpdateEvent.__typename).toBe('ForbiddenRejection')
    })

    describe('when user is admin', () => {
      let request: RequestApp

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it('should update any event', async () => {
        const { id: ownerId } = await factories.user.create({ email: 'owner@test.com', firstName: 'O', lastName: 'W' })
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({ title: 'Original', maintainerId: ownerId })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { id: eventId, input: { title: 'Admin Updated', eventDate: futureDate() } },
          })
          .expect(200)

        expect(res.body.data.adminUpdateEvent).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Tables.EVENT).row(0).toMatchObject({ id: eventId, title: 'Admin Updated' })
      })

      it('should return ValidationRejection when title is empty', async () => {
        const { id: ownerId } = await factories.user.create({ email: 'owner@test.com', firstName: 'O', lastName: 'W' })
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({ title: 'Original', maintainerId: ownerId })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId, input: { title: '', eventDate: futureDate() } } })
          .expect(200)

        expect(res.body.data.adminUpdateEvent.__typename).toBe('ValidationRejection')
      })

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), input: { title: 'X', eventDate: futureDate() } } })
          .expect(200)

        expect(res.body.data.adminUpdateEvent.__typename).toBe('NotFoundRejection')
      })
    })
  })

  describe('Mutation adminDeleteEvent', () => {
    const mutation = /* GraphQL */ `
      mutation AdminDeleteEvent($id: EventId!) {
        adminDeleteEvent(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should reject with ForbiddenRejection for a non-admin user', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data.adminDeleteEvent.__typename).toBe('ForbiddenRejection')
    })

    describe('when user is admin', () => {
      let request: RequestApp

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it('should delete any event without wishlists', async () => {
        const { id: ownerId } = await factories.user.create({ email: 'owner@test.com', firstName: 'O', lastName: 'W' })
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({ title: 'To Delete', maintainerId: ownerId })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId } })
          .expect(200)

        expect(res.body.data.adminDeleteEvent).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Tables.EVENT).hasNumberOfRows(0)
      })

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200)

        expect(res.body.data.adminDeleteEvent.__typename).toBe('NotFoundRejection')
      })
    })
  })

  describe('Mutation adminDeleteEventAttendee', () => {
    const mutation = /* GraphQL */ `
      mutation AdminDeleteEventAttendee($eventId: EventId!, $attendeeId: AttendeeId!) {
        adminDeleteEventAttendee(eventId: $eventId, attendeeId: $attendeeId) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should reject with ForbiddenRejection for a non-admin user', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { eventId: uuid(), attendeeId: uuid() } })
        .expect(200)

      expect(res.body.data.adminDeleteEventAttendee.__typename).toBe('ForbiddenRejection')
    })

    describe('when user is admin', () => {
      let request: RequestApp

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it('should delete an attendee from any event', async () => {
        const { id: ownerId } = await factories.user.create({ email: 'owner@test.com', firstName: 'O', lastName: 'W' })
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({ title: 'Event', maintainerId: ownerId })
        const { id: attendeeId } = await factories.eventAttendee.createPending({
          eventId,
          tempUserEmail: 'pending@test.com',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId } })
          .expect(200)

        expect(res.body.data.adminDeleteEventAttendee).toEqual({ __typename: 'VoidOutput', success: true })

        // Only the maintainer attendee remains
        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(1)
      })

      it('should return NotFoundRejection when the attendee does not exist', async () => {
        const { id: ownerId } = await factories.user.create({ email: 'owner@test.com', firstName: 'O', lastName: 'W' })
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({ title: 'Event', maintainerId: ownerId })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId: uuid() } })
          .expect(200)

        expect(res.body.data.adminDeleteEventAttendee.__typename).toBe('NotFoundRejection')
      })
    })
  })
})
