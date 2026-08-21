import type { RequestApp } from '@wishlist/api-test-utils'

import { Factories, Tables, useTestApp } from '@wishlist/api-test-utils'
import { AttendeeRole, uuid } from '@wishlist/common'

describe('EventAttendeeController', () => {
  const { getRequest, getFactories, expectTable, expectMail } = useTestApp()
  let factories: Factories

  beforeEach(() => {
    factories = getFactories()
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
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await factories.getSignedUserId('BASE_USER')
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
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
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
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
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

        await expectTable(Tables.EVENT_ATTENDEE)
          .hasNumberOfRows(2) // maintainer + new attendee
          .row(1)
          .toMatchObject({
            id: createdId,
            event_id: eventId,
            temp_user_email: 'new-attendee@example.com',
            role: AttendeeRole.USER,
          })

        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(1)
          .mail(0)
          .hasSubject('[Wishlist] Vous participez à un nouvel événement')
          .hasReceiver('new-attendee@example.com')
      })

      it('should create active attendee successfully', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const { id: otherUserId } = await factories.user.create({
          email: 'other@example.com',
          firstName: 'Other',
          lastName: 'User',
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

        await expectTable(Tables.EVENT_ATTENDEE)
          .hasNumberOfRows(2) // maintainer + new attendee
          .row(1)
          .toMatchObject({
            id: createdId,
            event_id: eventId,
            user_id: otherUserId,
            role: AttendeeRole.USER,
          })

        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(1)
          .mail(0)
          .hasSubject('[Wishlist] Vous participez à un nouvel événement')
          .hasReceiver('other@example.com')
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

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(0)
      })

      it('should return 401 when user is not maintainer of event', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@example.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
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

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(1) // only maintainer
      })

      it('should return 400 when attendee already exists for this event', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const existingEmail = 'existing@example.com'
        await factories.eventAttendee.createPending({
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

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(2) // maintainer + existing attendee
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
        currentUserId = await factories.getSignedUserId('BASE_USER')
      })

      it('should return 404 when attendee does not exist', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
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
        const { id: otherUserId } = await factories.user.create({
          email: 'other@example.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: otherUserId,
        })

        const { id: attendeeId } = await factories.eventAttendee.createPending({
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

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(2) // maintainer + attendee
      })

      it('should return 409 when trying to delete yourself', async () => {
        const {
          event: { id: eventId },
          attendee: { id: attendeeId },
        } = await factories.event.createWithMaintainer({
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

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(1) // maintainer still exists
      })

      it('should return 409 when attendee has wishlist with items', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'attendee@example.com',
          firstName: 'Attendee',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const { id: attendeeId } = await factories.eventAttendee.create({
          eventId,
          userId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Test Wishlist',
        })

        await factories.item.create({
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

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(2) // maintainer + attendee
        await expectTable(Tables.WISHLIST).hasNumberOfRows(1)
        await expectTable(Tables.ITEM).hasNumberOfRows(1)
      })

      it('should delete pending attendee successfully', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const { id: attendeeId } = await factories.eventAttendee.createPending({
          eventId,
          tempUserEmail: 'attendee@example.com',
        })

        await request.delete(path({ eventId, attendeeId })).expect(200)

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(1) // only maintainer remains
      })

      it('should delete active attendee successfully', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'attendee@example.com',
          firstName: 'Attendee',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const { id: attendeeId } = await factories.eventAttendee.create({
          eventId,
          userId: otherUserId,
        })

        await request.delete(path({ eventId, attendeeId })).expect(200)

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(1) // only maintainer remains
      })

      it('should delete active attendee successfully if a wishlist exists but from another attendee', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Test Wishlist',
        })

        const {
          attendee: { id: attendeeId1 },
        } = await factories.user.createAndJoinEvent({
          email: 'attendee1@example.com',
          firstName: 'User 1',
          lastName: 'User 1',
          eventId,
        })

        await factories.user.createAndJoinEvent({
          email: 'attendee2@example.com',
          firstName: 'User 2',
          lastName: 'User 2',
          eventId,
        })

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(3)
        await expectTable(Tables.WISHLIST).hasNumberOfRows(1)

        await request.delete(path({ eventId, attendeeId: attendeeId1 })).expect(200)

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(2) // 2 attendee remaining (attendee2 and maintainer)
        await expectTable(Tables.WISHLIST).hasNumberOfRows(1) // wishlist still exists
      })

      it('should unlink wishlist from event when attendee has wishlist linked to multiple events', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'attendee@example.com',
          firstName: 'Attendee',
          lastName: 'User',
        })

        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event 1',
          description: 'Test Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event 2',
          description: 'Test Description 2',
          maintainerId: otherUserId,
        })

        const { id: attendeeId } = await factories.eventAttendee.create({
          eventId: eventId1,
          userId: otherUserId,
        })

        await factories.wishlist.create({
          eventIds: [eventId1, eventId2],
          ownerId: otherUserId,
          title: 'Test Wishlist',
        })

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(3) // 2 attendees for eventId1 and 1 for eventId2
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(2) // linked to eventId1 and eventId2

        await request.delete(path({ eventId: eventId1, attendeeId })).expect(200)

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(2) // 1 attendee for eventId1 and 1 for eventId2
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1) // linked to eventId2
        await expectTable(Tables.WISHLIST).hasNumberOfRows(1) // wishlist still exists
      })
    })
  })
})
