import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

import { Fixtures, RequestApp, useTestApp } from './utils'

describe('EventController', () => {
  const { getRequest, getFixtures } = useTestApp()
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

        await fixtures.insertWishlist({ eventId: eventId1, userId: currentUserId, title: 'Wishlist1' })

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

        const wishlistId = await fixtures.insertWishlist({ eventId, userId: currentUserId, title: 'Wishlist1' })
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

  // TODO:
  // describe('POST /event', () => {
  //   const path = '/event'
  // })
  //
  // TODO:
  // describe('PUT /event/:id', () => {
  //   const path = (id: string) => `/event/${id}`
  // })
  //
  // TODO:
  // describe('DELETE /event/:id', () => {
  //   const path = (id: string) => `/event/${id}`
  // })
})
