import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

describe('EventController', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('GET /event', () => {
    const path = '/event'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.get(path).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return events when user is maintainer attendee', async () => {
        const event1Date = DateTime.now().plus({ days: 1 })
        const { eventId: eventId1, attendeeId: maintainerAttendeeId } = await fixtures.insertEventWithMaintainer({
          title: 'Event1',
          description: 'Description1',
          eventDate: event1Date.toJSDate(),
          maintainerId: currentUserId,
        })

        const attendeeId1 = await fixtures.insertPendingAttendee({ eventId: eventId1, tempUserEmail: 'temp@temp.fr' })

        await fixtures.insertWishlist({ eventIds: [eventId1], userId: currentUserId, title: 'Wishlist1' })

        await fixtures.insertEvent({
          title: 'Event2',
          description: 'Description2',
          eventDate: new Date(),
        })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) =>
            expect(body).toEqual({
              resources: [
                {
                  id: eventId1,
                  title: 'Event1',
                  description: 'Description1',
                  event_date: event1Date.toISODate(),
                  nb_wishlists: 1,
                  attendees: [
                    {
                      id: maintainerAttendeeId,
                      role: 'maintainer',
                      user: {
                        id: currentUserId,
                        email: Fixtures.BASE_USER_EMAIL,
                        firstname: 'John',
                        lastname: 'Doe',
                      },
                    },
                    {
                      id: attendeeId1,
                      pending_email: 'temp@temp.fr',
                      role: 'user',
                    },
                  ],
                  created_at: expect.toBeDateString(),
                  updated_at: expect.toBeDateString(),
                },
              ],
              pagination: { page_number: 1, total_elements: 1, total_pages: 1, pages_size: 10 },
            }),
          )
      })

      it('should return events when user is attendee of 2 different events', async () => {
        const event1Date = DateTime.now().plus({ days: 1 })
        const { eventId: eventId1 } = await fixtures.insertEventWithMaintainer({
          title: 'Event1',
          description: 'Description1',
          eventDate: event1Date.toJSDate(),
          maintainerId: currentUserId,
        })

        const event2CreatorId = await fixtures.insertUser({
          email: 'user2@user2.fr',
          firstname: 'User2',
          lastname: 'USER2',
        })
        const event2Date = DateTime.now().plus({ year: 1 }).toJSDate()
        const { eventId: eventId2 } = await fixtures.insertEventWithMaintainer({
          title: 'Event2',
          description: 'Description2',
          eventDate: event2Date,
          maintainerId: event2CreatorId,
        })

        await fixtures.insertActiveAttendee({ eventId: eventId2, userId: currentUserId })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) =>
            expect(body).toEqual({
              resources: expect.arrayContaining([
                expect.objectContaining({ id: eventId1 }),
                expect.objectContaining({ id: eventId2 }),
              ]),
              pagination: { page_number: 1, total_elements: 2, total_pages: 1, pages_size: 10 },
            }),
          )
      })

      it('should return no events when user not part of any events', async () => {
        const event1CreatorId = await fixtures.insertUser({
          email: 'user2@user2.fr',
          firstname: 'User2',
          lastname: 'USER2',
        })
        const event2CreatorId = await fixtures.insertUser({
          email: 'user3@user3.fr',
          firstname: 'User3',
          lastname: 'USER3',
        })

        await fixtures.insertEventWithMaintainer({
          title: 'Event1',
          description: 'Description1',
          eventDate: new Date(),
          maintainerId: event1CreatorId,
        })

        await fixtures.insertEventWithMaintainer({
          title: 'Event2',
          description: 'Description2',
          eventDate: new Date(),
          maintainerId: event2CreatorId,
        })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) =>
            expect(body).toEqual({
              resources: [],
              pagination: { page_number: 1, total_elements: 0, total_pages: 0, pages_size: 10 },
            }),
          )
      })

      describe('pagination', () => {
        it('should limit number of events when option is enabled', async () => {
          const eventPromises = []
          for (let i = 0; i < 6; i++) {
            eventPromises.push(
              fixtures.insertEventWithMaintainer({
                title: `Event${i}`,
                description: `Description${i}`,
                eventDate: new Date(),
                maintainerId: currentUserId,
              }),
            )
          }
          await Promise.all(eventPromises)

          await request
            .get(path)
            .query({ limit: 5 })
            .expect(200)
            .expect(({ body }) => {
              expect(body.resources).toHaveLength(5)
              expect(body.pagination).toEqual({
                page_number: 1,
                total_elements: 6,
                total_pages: 2,
                pages_size: 5,
              })
            })
        })

        it('should return page 2 when option is set', async () => {
          const eventPromises = []
          for (let i = 0; i < 6; i++) {
            eventPromises.push(
              fixtures.insertEventWithMaintainer({
                title: `Event${i}`,
                description: `Description${i}`,
                eventDate: new Date(),
                maintainerId: currentUserId,
              }),
            )
          }
          await Promise.all(eventPromises)

          await request
            .get(path)
            .query({ limit: 5, p: 2 })
            .expect(200)
            .expect(({ body }) => {
              expect(body.resources).toHaveLength(1)
              expect(body.pagination).toEqual({
                page_number: 2,
                total_elements: 6,
                total_pages: 2,
                pages_size: 5,
              })
            })
        })

        it('should return only future event when option is enabled', async () => {
          const eventPromises = []
          for (let i = 0; i < 6; i++) {
            eventPromises.push(
              fixtures.insertEventWithMaintainer({
                title: `Event${i}`,
                description: `Description${i}`,
                eventDate:
                  i % 2 === 0
                    ? DateTime.now().plus({ days: 1 }).toJSDate()
                    : DateTime.now().minus({ days: 1 }).toJSDate(),
                maintainerId: currentUserId,
              }),
            )
          }
          await Promise.all(eventPromises)

          await request
            .get(path)
            .query({ only_future: true, limit: 10 })
            .expect(200)
            .expect(({ body }) => {
              expect(body.resources).toHaveLength(3)
              expect(body.pagination).toEqual({
                page_number: 1,
                total_elements: 3,
                total_pages: 1,
                pages_size: 10,
              })
            })
        })
      })
    })
  })

  describe('GET /event/:id', () => {
    const path = (id: string) => `/event/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.get(path(uuid())).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return error when event not exist', async () => {
        await request.get(path(uuid())).expect(404)
      })

      it('should return error when current user not part of event', async () => {
        const eventId = await fixtures.insertEvent({
          title: 'Event1',
          description: 'Description1',
          eventDate: new Date(),
        })

        await request.get(path(eventId)).expect(404)
      })

      it('should return event when current user is attendee MAINTAINER', async () => {
        const userId2 = await fixtures.insertUser({
          email: 'user2@user2.fr',
          firstname: 'User2',
          lastname: 'USER2',
        })
        const eventDate = DateTime.now().plus({ days: 1 })
        const { eventId, attendeeId: maintainerAttendeeId } = await fixtures.insertEventWithMaintainer({
          title: 'Event1',
          description: 'Description1',
          eventDate: eventDate.toJSDate(),
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Wishlist1',
        })
        const activeAttendeeId = await fixtures.insertActiveAttendee({
          eventId,
          userId: userId2,
        })
        const pendingAttendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'temp@temp.fr',
        })

        await request
          .get(path(eventId))
          .expect(200)
          .expect(({ body }) =>
            expect(body).toEqual({
              id: eventId,
              title: 'Event1',
              description: 'Description1',
              event_date: eventDate.toISODate(),
              wishlists: [
                {
                  id: wishlistId,
                  title: 'Wishlist1',
                  config: {
                    hide_items: true,
                  },
                  owner: {
                    id: currentUserId,
                    email: Fixtures.BASE_USER_EMAIL,
                    firstname: 'John',
                    lastname: 'Doe',
                  },
                  created_at: expect.toBeDateString(),
                  updated_at: expect.toBeDateString(),
                },
              ],
              attendees: expect.toIncludeSameMembers([
                {
                  id: maintainerAttendeeId,
                  role: 'maintainer',
                  user: {
                    id: currentUserId,
                    email: Fixtures.BASE_USER_EMAIL,
                    firstname: 'John',
                    lastname: 'Doe',
                  },
                },
                {
                  id: activeAttendeeId,
                  role: 'user',
                  user: {
                    id: userId2,
                    email: 'user2@user2.fr',
                    firstname: 'User2',
                    lastname: 'USER2',
                  },
                },
                {
                  id: pendingAttendeeId,
                  pending_email: 'temp@temp.fr',
                  role: 'user',
                },
              ]),
              created_at: expect.toBeDateString(),
              updated_at: expect.toBeDateString(),
            }),
          )
      })

      it('should return event when current user is attendee USER', async () => {
        const creatorId = await fixtures.insertUser({
          email: 'user2@user2.fr',
          firstname: 'User2',
          lastname: 'USER2',
        })
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event1',
          description: 'Description1',
          eventDate: new Date(),
          maintainerId: creatorId,
        })
        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
        })

        await request
          .get(path(eventId))
          .expect(200)
          .expect(({ body }) => {
            expect(body).toMatchObject({ id: eventId })
          })
      })
    })
  })

  describe('POST /event', () => {
    const path = '/event'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .post(path)
        .send({
          title: 'Test Event',
          description: 'Test Description',
          event_date: DateTime.now().plus({ days: 1 }).toISODate(),
        })
        .expect(401)
    })

    describe('when user is authenticated', () => {
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
          message: ['title must be shorter than or equal to 100 characters', 'event_date should not be empty'],
        },
        {
          body: { title: '' },
          case: 'empty title',
          message: ['title should not be empty'],
        },
        {
          body: { title: 'a'.repeat(101) },
          case: 'title too long',
          message: ['title must be shorter than or equal to 100 characters'],
        },
        {
          body: {
            title: 'Valid Title',
            description: 'a'.repeat(2001),
            event_date: DateTime.now().plus({ days: 1 }).toISODate(),
          },
          case: 'description too long',
          message: ['description must be shorter than or equal to 2000 characters'],
        },
        {
          body: {
            title: 'Valid Title',
            event_date: DateTime.now().minus({ days: 1 }).toISODate(),
          },
          case: 'event_date in the past',
          message: ['event_date must not be earlier than today'],
        },
        {
          body: {
            title: 'Valid Title',
            event_date: 'not-a-date',
          },
          case: 'event_date not a date',
          message: ['event_date must be a Date instance'],
        },
        {
          body: {
            title: 'Valid Title',
            event_date: DateTime.now().plus({ days: 1 }).toISODate(),
            attendees: [{ email: 'invalid-email' }],
          },
          case: 'invalid attendee email',
          message: ['attendees.0.email must be an email'],
        },
        {
          body: {
            title: 'Valid Title',
            event_date: DateTime.now().plus({ days: 1 }).toISODate(),
            attendees: [{ email: 'test@test.com', role: 'invalid-role' }],
          },
          case: 'invalid attendee role',
          message: ['attendees.0.role must be one of the following values: maintainer, user'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        await request
          .post(path)
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          )
      })

      it('should create event successfully', async () => {
        const eventDate = DateTime.now().plus({ days: 1 }).toISODate()

        const response = await request
          .post(path)
          .send({
            title: 'Test Event',
            description: 'Test Description',
            event_date: eventDate,
          })
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              title: 'Test Event',
              description: 'Test Description',
              event_date: eventDate,
            })
          })

        const createdEventId = response.body.id

        await expectTable(Fixtures.EVENT_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: createdEventId,
            title: 'Test Event',
            description: 'Test Description',
            event_date: new Date(eventDate),
            created_at: expect.toBeDate(),
            updated_at: expect.toBeDate(),
          })
          .check()

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            event_id: createdEventId,
            user_id: currentUserId,
            role: 'maintainer',
          })
          .check()
      })

      it('should create event with attendees', async () => {
        const user1Id = await fixtures.insertUser({
          email: 'user1@test.com',
          firstname: 'User1',
          lastname: 'USER1',
        })

        const user2Email = 'user2@test.com'

        const eventDate = DateTime.now().plus({ days: 1 }).toISODate()

        const eventData = {
          title: 'Test Event',
          description: 'Test Description',
          event_date: eventDate,
          attendees: [
            {
              email: 'user1@test.com',
              role: 'maintainer',
            },
            {
              email: user2Email,
              role: 'user',
            },
          ],
        }

        const response = await request
          .post(path)
          .send(eventData)
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              title: 'Test Event',
              description: 'Test Description',
              event_date: eventDate,
            })
          })

        const createdEventId = response.body.id

        await expectTable(Fixtures.EVENT_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: createdEventId,
            title: 'Test Event',
            description: 'Test Description',
            event_date: new Date(eventDate),
          })
          .check()

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(3)
          .row(0)
          .toMatchObject({
            event_id: createdEventId,
            user_id: currentUserId,
            role: 'maintainer',
          })
          .row(1)
          .toMatchObject({
            event_id: createdEventId,
            user_id: user1Id,
            role: 'maintainer',
          })
          .row(2)
          .toMatchObject({
            event_id: createdEventId,
            temp_user_email: user2Email,
            role: 'user',
          })
          .check()

        // TODO(MailsAssert): assert mails are sent
      })
    })
  })

  describe('PUT /event/:id', () => {
    const path = (id: string) => `/event/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .put(path(uuid()))
        .send({
          title: 'Updated Event',
          description: 'Updated Description',
          event_date: DateTime.now().plus({ days: 1 }).toISODate(),
        })
        .expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return 404 when event not exists', async () => {
        await request
          .put(path(uuid()))
          .send({
            title: 'Updated Event',
            description: 'Updated Description',
            event_date: DateTime.now().plus({ days: 1 }).toISODate(),
          })
          .expect(404)
      })

      it('should return 404 when user is not maintainer of the event', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await request
          .put(path(eventId))
          .send({
            title: 'Updated Event',
            description: 'Updated Description',
            event_date: DateTime.now().plus({ days: 1 }).toISODate(),
          })
          .expect(401)
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['title must be shorter than or equal to 100 characters', 'event_date should not be empty'],
        },
        {
          body: { title: '' },
          case: 'empty title',
          message: ['title should not be empty'],
        },
        {
          body: { title: 'a'.repeat(101) },
          case: 'title too long',
          message: ['title must be shorter than or equal to 100 characters'],
        },
        {
          body: {
            title: 'Valid Title',
            description: 'a'.repeat(2001),
            event_date: DateTime.now().plus({ days: 1 }).toISODate(),
          },
          case: 'description too long',
          message: ['description must be shorter than or equal to 2000 characters'],
        },
        {
          body: {
            title: 'Valid Title',
            event_date: DateTime.now().minus({ days: 1 }).toISODate(),
          },
          case: 'event_date in the past',
          message: ['event_date must not be earlier than today'],
        },
        {
          body: {
            title: 'Valid Title',
            event_date: 'not-a-date',
          },
          case: 'event_date not a date',
          message: ['event_date must be a Date instance'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await request
          .put(path(eventId))
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          )
      })

      it('should update event successfully when user is maintainer', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original Event',
          description: 'Original Description',
          maintainerId: currentUserId,
        })

        const updateData = {
          title: 'Updated Event',
          description: 'Updated Description',
          event_date: DateTime.now().plus({ days: 2 }).toISODate(),
        }

        await request.put(path(eventId)).send(updateData).expect(200)

        await expectTable(Fixtures.EVENT_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: eventId,
            title: 'Updated Event',
            description: 'Updated Description',
            event_date: new Date(updateData.event_date),
            updated_at: expect.toBeDate(),
          })
          .check()
      })

      it('should update event without description', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original Event',
          description: 'Original Description',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const updateData = {
          title: 'Updated Event',
          event_date: DateTime.now().plus({ days: 2 }).toISODate(),
        }

        await request.put(path(eventId)).send(updateData).expect(200)

        await expectTable(Fixtures.EVENT_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: eventId,
            title: 'Updated Event',
            description: null,
            event_date: new Date(updateData.event_date),
            updated_at: expect.toBeDate(),
          })
          .check()
      })
    })
  })

  describe('DELETE /event/:id', () => {
    const path = (id: string) => `/event/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.delete(path(uuid())).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return 404 when event not exists', async () => {
        await request.delete(path(uuid())).expect(404)
      })

      it('should return 404 when user is not maintainer of the event', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          description: 'Description',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: otherUserId,
        })

        await request.delete(path(eventId)).expect(401)

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).check()
      })

      it('should delete event successfully when user is maintainer', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event to Delete',
          description: 'Description',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Test Wishlist',
        })

        await request.delete(path(eventId)).expect(200)

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0).check()
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(0).check()
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0).check()
      })

      it('should delete event with attendees and related data', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event to Delete',
          description: 'Description',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
        })

        await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'pending@test.com',
        })

        await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Maintainer Wishlist',
        })

        await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other User Wishlist',
        })

        await request.delete(path(eventId)).expect(200)

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0).check()
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(0).check()
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0).check()
      })
    })
  })
})
