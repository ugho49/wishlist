import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

/**
 * Integration tests for the GraphQL EventMutationResolver.
 *
 * GraphQL always returns HTTP 200; thrown Nest exceptions are mapped by the
 * error transform plugin to typed rejections placed at data.<field>:
 *   ZodValidationException  -> ValidationRejection
 *   UnauthorizedException   -> UnauthorizedRejection
 *   NotFoundException       -> NotFoundRejection
 *   ForbiddenException      -> ForbiddenRejection
 *   other HttpException     -> InternalErrorRejection
 */
const GRAPHQL_PATH = '/graphql'

const futureDate = () => DateTime.now().plus({ days: 30 }).toISODate() as string

describe('EventMutationResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('Mutation createEvent', () => {
    const mutation = /* GraphQL */ `
      mutation CreateEvent($input: CreateEventInput!) {
        createEvent(input: $input) {
          __typename
          ... on Event {
            id
            title
            description
            icon
            eventDate
            attendeeIds
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
    `

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { input: { title: 'My Event', eventDate: futureDate() } } })
        .expect(200)

      expect(res.body.data?.createEvent?.__typename).not.toBe('Event')
      await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should create an event successfully (creator becomes maintainer attendee)', async () => {
        const eventDate = futureDate()
        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: {
              input: { title: 'Christmas', description: 'Family party', icon: '🎄', eventDate },
            },
          })
          .expect(200)

        expect(res.body.data.createEvent).toMatchObject({
          __typename: 'Event',
          id: expect.toBeString(),
          title: 'Christmas',
          description: 'Family party',
          icon: '🎄',
          eventDate,
        })
        // Creator is automatically added as a maintainer attendee.
        expect(res.body.data.createEvent.attendeeIds).toHaveLength(1)

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: res.body.data.createEvent.id,
          title: 'Christmas',
          description: 'Family party',
          icon: '🎄',
        })

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          event_id: res.body.data.createEvent.id,
          user_id: currentUserId,
          role: 'maintainer',
        })
      })

      it('should create an event with an additional attendee', async () => {
        const eventDate = futureDate()
        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: {
              input: {
                title: 'New Year',
                eventDate,
                attendees: [{ email: 'invited@test.com', role: 'USER' }],
              },
            },
          })
          .expect(200)

        expect(res.body.data.createEvent.__typename).toBe('Event')
        expect(res.body.data.createEvent.attendeeIds).toHaveLength(2)

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1)
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2)
      })

      it.each([
        { case: 'empty title', input: { title: '', eventDate: futureDate() }, field: 'title' },
        { case: 'title too long', input: { title: 'a'.repeat(101), eventDate: futureDate() }, field: 'title' },
        { case: 'invalid event date', input: { title: 'Event', eventDate: 'not-a-date' }, field: 'eventDate' },
        { case: 'invalid icon', input: { title: 'Event', eventDate: futureDate(), icon: 'abc' }, field: 'icon' },
        {
          case: 'invalid attendee email',
          input: { title: 'Event', eventDate: futureDate(), attendees: [{ email: 'not-an-email' }] },
          field: 'attendees',
        },
      ])('should return ValidationRejection when invalid input: $case', async ({ input, field }) => {
        const res = await request.post(GRAPHQL_PATH).send({ query: mutation, variables: { input } }).expect(200)

        expect(res.body.data.createEvent.__typename).toBe('ValidationRejection')
        expect(res.body.data.createEvent.errors).toEqual(
          expect.arrayContaining([expect.objectContaining({ field: expect.stringContaining(field) })]),
        )

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0)
      })
    })
  })

  describe('Mutation updateEvent', () => {
    const mutation = /* GraphQL */ `
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
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid(), input: { title: 'Updated', eventDate: futureDate() } } })
        .expect(200)

      expect(res.body.data?.updateEvent?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should update an event the user maintains', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original',
          maintainerId: currentUserId,
        })

        const eventDate = futureDate()
        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { id: eventId, input: { title: 'Updated Title', description: 'New desc', eventDate } },
          })
          .expect(200)

        expect(res.body.data.updateEvent).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: eventId,
          title: 'Updated Title',
          description: 'New desc',
        })
      })

      it('should return ValidationRejection when title is empty', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original',
          maintainerId: currentUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId, input: { title: '', eventDate: futureDate() } } })
          .expect(200)

        expect(res.body.data.updateEvent.__typename).toBe('ValidationRejection')

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({ title: 'Original' })
      })

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), input: { title: 'Updated', eventDate: futureDate() } } })
          .expect(200)

        expect(res.body.data.updateEvent.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original',
          maintainerId: otherUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId, input: { title: 'Hacked', eventDate: futureDate() } } })
          .expect(200)

        expect(res.body.data.updateEvent.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({ title: 'Original' })
      })
    })
  })

  describe('Mutation deleteEvent', () => {
    const mutation = /* GraphQL */ `
      mutation DeleteEvent($id: EventId!) {
        deleteEvent(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data?.deleteEvent?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should delete an event the user maintains (no wishlists)', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'To Delete',
          maintainerId: currentUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId } })
          .expect(200)

        expect(res.body.data.deleteEvent).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0)
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(0)
      })

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200)

        expect(res.body.data.deleteEvent.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId } })
          .expect(200)

        expect(res.body.data.deleteEvent.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1)
      })
    })
  })

  describe('Mutation addEventAttendee', () => {
    const mutation = /* GraphQL */ `
      mutation AddEventAttendee($eventId: EventId!, $input: AddEventAttendeeInput!) {
        addEventAttendee(eventId: $eventId, input: $input) {
          __typename
          ... on EventAttendee {
            id
            pendingEmail
            role
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
    `

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { eventId: uuid(), input: { email: 'a@test.com' } } })
        .expect(200)

      expect(res.body.data?.addEventAttendee?.__typename).not.toBe('EventAttendee')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should add a pending attendee to an event the user maintains', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { eventId, input: { email: 'invited@test.com', role: 'USER' } },
          })
          .expect(200)

        expect(res.body.data.addEventAttendee).toMatchObject({
          __typename: 'EventAttendee',
          id: expect.toBeString(),
          pendingEmail: 'invited@test.com',
          role: 'USER',
        })

        // 1 maintainer + 1 new attendee
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2)
      })

      it('should return ValidationRejection when the email is invalid', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, input: { email: 'not-an-email' } } })
          .expect(200)

        expect(res.body.data.addEventAttendee.__typename).toBe('ValidationRejection')
        expect(res.body.data.addEventAttendee.errors).toEqual(
          expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
        )

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1)
      })

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId: uuid(), input: { email: 'invited@test.com' } } })
          .expect(200)

        expect(res.body.data.addEventAttendee.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, input: { email: 'invited@test.com' } } })
          .expect(200)

        expect(res.body.data.addEventAttendee.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1)
      })
    })
  })

  describe('Mutation removeEventAttendee', () => {
    const mutation = /* GraphQL */ `
      mutation RemoveEventAttendee($eventId: EventId!, $attendeeId: AttendeeId!) {
        removeEventAttendee(eventId: $eventId, attendeeId: $attendeeId) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { eventId: uuid(), attendeeId: uuid() } })
        .expect(200)

      expect(res.body.data?.removeEventAttendee?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should remove a pending attendee from an event the user maintains', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        })

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'pending@test.com',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId } })
          .expect(200)

        expect(res.body.data.removeEventAttendee).toEqual({ __typename: 'VoidOutput', success: true })

        // Only the maintainer attendee remains
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          user_id: currentUserId,
          role: 'maintainer',
        })
      })

      it('should return NotFoundRejection when the attendee does not exist on the event', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId: uuid() } })
          .expect(200)

        expect(res.body.data.removeEventAttendee.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'pending@test.com',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId } })
          .expect(200)

        expect(res.body.data.removeEventAttendee.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2)
      })
    })
  })
})
