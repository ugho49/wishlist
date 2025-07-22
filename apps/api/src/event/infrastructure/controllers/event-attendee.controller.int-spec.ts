import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp, useTestMail } from '@wishlist/api-test-utils'
import { AttendeeRole, uuid } from '@wishlist/common'

describe('EventAttendeeController', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('POST /event/:eventId/attendee', () => {
    const path = (eventId: string) => `/event/${eventId}/attendee`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .post(path(uuid()))
        .send({
          email: 'test@example.com',
          role: AttendeeRole.USER,
        })
        .expect(401)
    })

    describe('when user is authenticated', () => {
      const { expectMail } = useTestMail()
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['email should not be empty'],
        },
        {
          body: { email: 'test@example.com', role: 'invalid-role' },
          case: 'invalid role',
          message: ['role must be one of the following values: maintainer, user'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        await request
          .post(path(eventId))
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: expect.arrayContaining(message),
            }),
          )
      })

      it('should create pending attendee successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const response = await request
          .post(path(eventId))
          .send({
            email: 'new-attendee@example.com',
            role: AttendeeRole.USER,
          })
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              pending_email: 'new-attendee@example.com',
              role: AttendeeRole.USER,
            })
          })

        const createdId = response.body.id

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(2) // maintainer + new attendee
          .row(1)
          .toMatchObject({
            id: createdId,
            event_id: eventId,
            temp_user_email: 'new-attendee@example.com',
            role: AttendeeRole.USER,
          })
          .check()

        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(1)
          .mail(0)
          .hasSubject('[Wishlist] Vous participez à un nouvel événement')
          .hasReceiver('new-attendee@example.com')
          .check()
      })

      it('should create active attendee successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const otherUserId = await fixtures.insertUser({
          email: 'other@example.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const response = await request
          .post(path(eventId))
          .send({
            email: 'other@example.com',
            role: AttendeeRole.USER,
          })
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              role: AttendeeRole.USER,
              user: {
                id: otherUserId,
                email: 'other@example.com',
                firstname: 'Other',
                lastname: 'User',
              },
            })
          })

        const createdId = response.body.id

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(2) // maintainer + new attendee
          .row(1)
          .toMatchObject({
            id: createdId,
            event_id: eventId,
            user_id: otherUserId,
            role: AttendeeRole.USER,
          })
          .check()

        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(1)
          .mail(0)
          .hasSubject('[Wishlist] Vous participez à un nouvel événement')
          .hasReceiver('other@example.com')
          .check()
      })

      it('should return 404 when event does not exist', async () => {
        const nonExistentEventId = uuid()

        await request
          .post(path(nonExistentEventId))
          .send({
            email: 'test@example.com',
            role: AttendeeRole.USER,
          })
          .expect(404)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Not Found',
              message: 'Event not found',
            }),
          )

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(0).check()
      })

      it('should return 401 when user is not maintainer of event', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@example.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: otherUserId,
        })

        await request
          .post(path(eventId))
          .send({
            email: 'test@example.com',
            role: AttendeeRole.USER,
          })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'Only maintainers of the event can add an attendee',
            }),
          )

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).check() // only maintainer
      })

      it('should return 400 when attendee already exists for this event', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const existingEmail = 'existing@example.com'
        await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: existingEmail,
        })

        await request
          .post(path(eventId))
          .send({
            email: existingEmail,
            role: AttendeeRole.USER,
          })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: 'This attendee already exist for this event',
            }),
          )

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2).check() // maintainer + existing attendee
      })
    })
  })

  describe('DELETE /event/:eventId/attendee/:attendeeId', () => {
    const path = (params: { eventId: string; attendeeId: string }) =>
      `/event/${params.eventId}/attendee/${params.attendeeId}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      const eventId = uuid()
      const attendeeId = uuid()

      await request.delete(path({ eventId, attendeeId })).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return 404 when attendee does not exist', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const nonExistentAttendeeId = uuid()

        await request
          .delete(path({ eventId, attendeeId: nonExistentAttendeeId }))
          .expect(404)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Not Found',
              message: 'Attendee not found',
            }),
          )
      })

      it('should return 401 when user is not maintainer of event', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@example.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: otherUserId,
        })

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'attendee@example.com',
        })

        await request
          .delete(path({ eventId, attendeeId }))
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'Only maintainers of the event can delete an attendee',
            }),
          )

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2).check() // maintainer + attendee
      })

      it('should return 409 when trying to delete yourself', async () => {
        const { eventId, attendeeId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        await request
          .delete(path({ eventId, attendeeId }))
          .expect(409)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Conflict',
              message: 'You cannot delete yourself from the event',
            }),
          )

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).check() // maintainer still exists
      })

      it('should return 409 when attendee has wishlist with items', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'attendee@example.com',
          firstname: 'Attendee',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const attendeeId = await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Test Wishlist',
        })

        await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
          description: 'Test Description',
        })

        await request
          .delete(path({ eventId, attendeeId }))
          .expect(409)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Conflict',
              message:
                'You cannot remove this attendee from the event because he have a list in this event and the list have only this event attached',
            }),
          )

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2).check() // maintainer + attendee
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).check()
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).check()
      })

      it('should delete pending attendee successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'attendee@example.com',
        })

        await request.delete(path({ eventId, attendeeId })).expect(200)

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).check() // only maintainer remains
      })

      it('should delete active attendee successfully', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'attendee@example.com',
          firstname: 'Attendee',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const attendeeId = await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
        })

        await request.delete(path({ eventId, attendeeId })).expect(200)

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).check() // only maintainer remains
      })

      it('should unlink wishlist from event when attendee has wishlist linked to multiple events', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'attendee@example.com',
          firstname: 'Attendee',
          lastname: 'User',
        })

        const { eventId: eventId1 } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event 1',
          description: 'Test Description 1',
          maintainerId: currentUserId,
        })

        const { eventId: eventId2 } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event 2',
          description: 'Test Description 2',
          maintainerId: otherUserId,
        })

        const attendeeId = await fixtures.insertActiveAttendee({
          eventId: eventId1,
          userId: otherUserId,
        })

        await fixtures.insertWishlist({
          eventIds: [eventId1, eventId2],
          userId: otherUserId,
          title: 'Test Wishlist',
        })

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(3).check() // 2 attendees for eventId1 and 1 for eventId2
        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(2).check() // linked to eventId1 and eventId2

        await request.delete(path({ eventId: eventId1, attendeeId })).expect(200)

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2).check() // 1 attendee for eventId1 and 1 for eventId2
        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(1).check() // linked to eventId2
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).check() // wishlist still exists
      })
    })
  })
})
