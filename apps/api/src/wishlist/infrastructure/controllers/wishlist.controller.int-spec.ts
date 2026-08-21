import type { RequestApp } from '@wishlist/api-test-utils'

import { BASE_USER_EMAIL, Factories, Tables, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

describe('WishlistController', () => {
  const { getRequest, getFactories, expectTable } = useTestApp()
  let factories: Factories

  beforeEach(() => {
    factories = getFactories()
  })

  describe('GET /wishlist', () => {
    const path = '/wishlist'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.get(path).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await factories.getSignedUserId('BASE_USER')
      })

      it('should return empty list when user has no wishlists', async () => {
        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({
              resources: [],
              pagination: {
                total_pages: 0,
                total_elements: 0,
                page_number: 1,
                pages_size: 10,
              },
            })
          })
      })

      it('should return user wishlists with events ordered by event creation date DESC', async () => {
        const eventDate1 = DateTime.now().plus({ days: 1 })
        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
          eventDate: eventDate1.toJSDate(),
        })

        const eventDate2 = DateTime.now().plus({ days: 2 })
        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
          eventDate: eventDate2.toJSDate(),
        })

        const { id: wishlistId1 } = await factories.wishlist.create({
          eventIds: [eventId1],
          ownerId: currentUserId,
          title: 'Wishlist 1',
          description: 'Description 1',
        })

        const { id: wishlistId2 } = await factories.wishlist.create({
          eventIds: [eventId2],
          ownerId: currentUserId,
          title: 'Wishlist 2',
        })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({
              resources: [
                {
                  id: wishlistId2,
                  title: 'Wishlist 2',
                  config: {
                    hide_items: true,
                  },
                  events: [
                    {
                      id: eventId2,
                      title: 'Event 2',
                      description: 'Description 2',
                      event_date: eventDate2.toISODate(),
                    },
                  ],
                  owner: {
                    id: currentUserId,
                    email: BASE_USER_EMAIL,
                    firstname: 'John',
                    lastname: 'Doe',
                  },
                  created_at: expect.toBeDateString(),
                  updated_at: expect.toBeDateString(),
                },
                {
                  id: wishlistId1,
                  title: 'Wishlist 1',
                  description: 'Description 1',
                  config: {
                    hide_items: true,
                  },
                  events: [
                    {
                      id: eventId1,
                      title: 'Event 1',
                      description: 'Description 1',
                      event_date: eventDate1.toISODate(),
                    },
                  ],
                  owner: {
                    id: currentUserId,
                    email: BASE_USER_EMAIL,
                    firstname: 'John',
                    lastname: 'Doe',
                  },
                  created_at: expect.toBeDateString(),
                  updated_at: expect.toBeDateString(),
                },
              ],
              pagination: {
                total_pages: 1,
                total_elements: 2,
                page_number: 1,
                pages_size: 10,
              },
            })
          })
      })

      it('should handle pagination correctly', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        // Create multiple wishlists
        for (let i = 1; i <= 15; i++) {
          await factories.wishlist.create({
            eventIds: [eventId],
            ownerId: currentUserId,
            title: `Wishlist ${i}`,
          })
        }

        // Test first page without p parameter
        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body.resources).toHaveLength(10)
            expect(body.pagination).toEqual({
              total_pages: 2,
              total_elements: 15,
              page_number: 1,
              pages_size: 10,
            })
          })

        // Test first page with p parameter
        await request
          .get(path)
          .query({ p: 1 })
          .expect(200)
          .expect(({ body }) => {
            expect(body.resources).toHaveLength(10)
            expect(body.pagination).toEqual({
              total_pages: 2,
              total_elements: 15,
              page_number: 1,
              pages_size: 10,
            })
          })

        // Test second page
        await request
          .get(path)
          .query({ p: 2 })
          .expect(200)
          .expect(({ body }) => {
            expect(body.resources).toHaveLength(5)
            expect(body.pagination).toEqual({
              total_pages: 2,
              total_elements: 15,
              page_number: 2,
              pages_size: 10,
            })
          })
      })

      it('should not return wishlists from other users', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: currentUserEventId },
        } = await factories.event.createWithMaintainer({
          title: 'Current User Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const {
          event: { id: otherUserEventId },
        } = await factories.event.createWithMaintainer({
          title: 'Other User Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const { id: currentUserWishlistId } = await factories.wishlist.create({
          eventIds: [currentUserEventId],
          ownerId: currentUserId,
          title: 'Current User Wishlist',
        })

        await factories.wishlist.create({
          eventIds: [otherUserEventId],
          ownerId: otherUserId,
          title: 'Other User Wishlist',
        })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body.resources).toHaveLength(1)
            expect(body.resources[0].id).toEqual(currentUserWishlistId)
          })
      })

      it('should return user wishlist where user is only event attendee', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Shared Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        // Current user is attendee of the event
        await factories.eventAttendee.create({
          eventId,
          userId: currentUserId,
        })

        const { id: currentUserWishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Current User Wishlist',
        })

        await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Other User Wishlist',
        })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body.resources).toHaveLength(1)
            expect(body.resources[0].id).toEqual(currentUserWishlistId)
          })
      })

      it('should return wishlists where user is co-owner', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: otherUserId,
        })

        // Wishlist owned by current user
        const { id: ownedWishlistId } = await factories.wishlist.create({
          eventIds: [eventId1],
          ownerId: currentUserId,
          title: 'My Owned Wishlist',
        })

        // Wishlist co-owned by current user
        const { id: coOwnedWishlistId } = await factories.wishlist.create({
          eventIds: [eventId2],
          ownerId: otherUserId,
          title: 'Co-Owned Wishlist',
          hideItems: false,
          coOwnerId: currentUserId,
        })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body.resources).toHaveLength(2)
            // biome-ignore lint/suspicious/noExplicitAny: ok for testing
            expect(body.resources.map((r: any) => r.id)).toEqual(
              expect.arrayContaining([ownedWishlistId, coOwnedWishlistId]),
            )
          })
      })
    })
  })

  describe('GET /wishlist/:id', () => {
    const path = (id: string) => `/wishlist/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.get(path(uuid())).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await factories.getSignedUserId('BASE_USER')
      })

      it('should return 401 if wishlist does not exist', async () => {
        const nonExistentId = uuid()

        await request.get(path(nonExistentId)).expect(401)
      })

      it('should return 401 if user is not authorized to access wishlist', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: otherEventId },
        } = await factories.event.createWithMaintainer({
          title: 'Other Event',
          description: 'Other Description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [otherEventId],
          ownerId: otherUserId,
          title: 'Other Wishlist',
        })

        await request.get(path(wishlistId)).expect(401)
      })

      it('should return user own wishlist with all items visible when hideItems = false', async () => {
        const {
          event: { id: eventId },
          eventDate,
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'My Wishlist',
          description: 'My Description',
          hideItems: false,
        })

        const {
          user: { id: takerId },
        } = await factories.user.createAndJoinEvent({
          eventId,
          email: 'taker@test.com',
          firstName: 'Taker',
          lastName: 'TAKER',
        })

        const { id: normalItemId } = await factories.item.create({
          wishlistId,
          name: 'Normal Item',
          description: 'Normal Description',
          url: 'https://example.com',
          score: 5,
          isSuggested: false,
        })

        const { id: suggestedItemId } = await factories.item.create({
          wishlistId,
          name: 'Suggested Item',
          description: 'Suggested Description',
          isSuggested: true,
        })

        const { id: takenItemId } = await factories.item.create({
          wishlistId,
          name: 'Taken Item',
          takerId,
          takenAt: new Date('2024-01-01T10:00:00Z'),
          isSuggested: false,
        })

        await request
          .get(path(wishlistId))
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: wishlistId,
              title: 'My Wishlist',
              description: 'My Description',
              owner: {
                id: currentUserId,
                email: BASE_USER_EMAIL,
                firstname: 'John',
                lastname: 'Doe',
              },
              items: [
                {
                  id: normalItemId,
                  name: 'Normal Item',
                  description: 'Normal Description',
                  url: 'https://example.com',
                  score: 5,
                  is_suggested: false,
                  created_at: expect.toBeDateString(),
                },
                {
                  id: suggestedItemId,
                  name: 'Suggested Item',
                  description: 'Suggested Description',
                  is_suggested: true,
                  created_at: expect.toBeDateString(),
                },
                {
                  id: takenItemId,
                  name: 'Taken Item',
                  is_suggested: false,
                  taken_by: {
                    id: takerId,
                    email: 'taker@test.com',
                    firstname: 'Taker',
                    lastname: 'TAKER',
                  },
                  taken_at: '2024-01-01T10:00:00.000Z',
                  created_at: expect.toBeDateString(),
                },
              ],
              events: [
                {
                  id: eventId,
                  title: 'Test Event',
                  description: 'Test Description',
                  event_date: eventDate.toISODate(),
                },
              ],
              config: {
                hide_items: false,
              },
              created_at: expect.toBeDateString(),
              updated_at: expect.toBeDateString(),
            })
          })
      })

      it('should return user own wishlist with filtered items when hideItems = true', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'My Wishlist',
          hideItems: true,
        })

        const { id: normalItemId } = await factories.item.create({
          wishlistId,
          name: 'Normal Item',
          isSuggested: false,
        })

        // This item should NOT be visible to the owner when hideItems = true
        await factories.item.create({
          wishlistId,
          name: 'Suggested Item',
          isSuggested: true,
        })

        await request
          .get(path(wishlistId))
          .expect(200)
          .expect(({ body }) => {
            expect(body.items).toEqual(
              expect.arrayContaining([
                {
                  id: normalItemId,
                  name: 'Normal Item',
                  created_at: expect.toBeDateString(),
                },
              ]),
            )
          })
      })

      it.each([
        true,
        false,
      ])('should return other user wishlist with all items and sensitive info when hideItems = %s', async hideItems => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Shared Event',
          description: 'Shared Description',
          maintainerId: otherUserId,
        })

        // Make current user an attendee of the event
        await factories.eventAttendee.create({
          eventId,
          userId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Other Wishlist',
          hideItems,
        })

        const { id: normalItemId } = await factories.item.create({
          wishlistId,
          name: 'Normal Item',
          isSuggested: false,
        })

        const { id: suggestedItemId } = await factories.item.create({
          wishlistId,
          name: 'Suggested Item',
          isSuggested: true,
        })

        const { id: takenItemId } = await factories.item.create({
          wishlistId,
          name: 'Taken Item',
          takerId: currentUserId,
          takenAt: new Date('2024-01-01T10:00:00Z'),
          isSuggested: false,
        })

        await request
          .get(path(wishlistId))
          .expect(200)
          .expect(({ body }) => {
            expect(body.owner).toEqual({
              id: otherUserId,
              firstname: 'Other',
              lastname: 'User',
              email: 'other@test.com',
            })
            expect(body.items).toHaveLength(3)
            expect(body.items).toEqual(
              expect.arrayContaining([
                {
                  id: normalItemId,
                  name: 'Normal Item',
                  is_suggested: false,
                  created_at: expect.toBeDateString(),
                },
                {
                  id: suggestedItemId,
                  name: 'Suggested Item',
                  is_suggested: true,
                  created_at: expect.toBeDateString(),
                },
                {
                  id: takenItemId,
                  name: 'Taken Item',
                  is_suggested: false,
                  taken_by: {
                    id: currentUserId,
                    firstname: 'John',
                    lastname: 'Doe',
                    email: BASE_USER_EMAIL,
                  },
                  taken_at: '2024-01-01T10:00:00.000Z',
                  created_at: expect.toBeDateString(),
                },
              ]),
            )
          })
      })

      it('should return wishlist with multiple events', async () => {
        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1, eventId2],
          ownerId: currentUserId,
          title: 'Multi-Event Wishlist',
          hideItems: false,
        })

        await request
          .get(path(wishlistId))
          .expect(200)
          .expect(({ body }) => {
            expect(body.events).toHaveLength(2)
            expect(body.events).toEqual(
              expect.arrayContaining([
                {
                  id: eventId1,
                  title: 'Event 1',
                  description: 'Description 1',
                  event_date: expect.toBeDateString(),
                },
                {
                  id: eventId2,
                  title: 'Event 2',
                  description: 'Description 2',
                  event_date: expect.toBeDateString(),
                },
              ]),
            )
          })
      })

      describe('co-owner should have access', () => {
        it('should allow co-owner to view wishlist', async () => {
          const { id: otherUserId } = await factories.user.create({
            email: 'other@test.com',
            firstName: 'Other',
            lastName: 'User',
          })

          const {
            event: { id: eventId },
          } = await factories.event.createWithMaintainer({
            title: 'Event',
            description: 'Description',
            maintainerId: otherUserId,
          })

          const { id: wishlistId } = await factories.wishlist.create({
            eventIds: [eventId],
            ownerId: otherUserId,
            title: 'Co-Owned Wishlist',
            hideItems: false,
            coOwnerId: currentUserId,
          })

          await request
            .get(path(wishlistId))
            .expect(200)
            .expect(({ body }) => {
              expect(body).toMatchObject({
                id: wishlistId,
                title: 'Co-Owned Wishlist',
                owner: {
                  id: otherUserId,
                  email: 'other@test.com',
                  firstname: 'Other',
                  lastname: 'User',
                },
                co_owner: {
                  id: currentUserId,
                  email: BASE_USER_EMAIL,
                  firstname: 'John',
                  lastname: 'Doe',
                },
              })
            })
        })

        it('should filter suggested items for co-owner when hideItems = true', async () => {
          const { id: otherUserId } = await factories.user.create({
            email: 'other@test.com',
            firstName: 'Other',
            lastName: 'User',
          })

          const {
            event: { id: eventId },
          } = await factories.event.createWithMaintainer({
            title: 'Event',
            description: 'Description',
            maintainerId: otherUserId,
          })

          const { id: wishlistId } = await factories.wishlist.create({
            eventIds: [eventId],
            ownerId: otherUserId,
            title: 'Co-Owned Private Wishlist',
            hideItems: true,
            coOwnerId: currentUserId,
          })

          const { id: normalItemId } = await factories.item.create({
            wishlistId,
            name: 'Normal Item',
            isSuggested: false,
          })

          // This should NOT be visible to co-owner when hideItems = true
          await factories.item.create({
            wishlistId,
            name: 'Suggested Item',
            isSuggested: true,
          })

          await request
            .get(path(wishlistId))
            .expect(200)
            .expect(({ body }) => {
              expect(body.items).toHaveLength(1)
              expect(body.items[0].id).toEqual(normalItemId)
            })
        })
      })
    })
  })

  describe('POST /wishlist', () => {
    const path = '/wishlist'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .post(path)
        .field(
          'data',
          JSON.stringify({
            title: 'Test Wishlist',
            description: 'Test Description',
            event_ids: [uuid()],
          }),
        )
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
          message: ['title should not be empty', 'event_ids should not be empty'],
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
            event_ids: [uuid()],
          },
          case: 'description too long',
          message: ['description must be shorter than or equal to 2000 characters'],
        },
        {
          body: {
            title: 'Valid Title',
            event_ids: [],
          },
          case: 'empty event_ids array',
          message: ['event_ids should not be empty'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        await request
          .post(path)
          .field('data', JSON.stringify(body))
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          )

        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
      })

      it('should return 401 when user is not attendee of event', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              description: 'Test Description',
              event_ids: [eventId],
            }),
          )
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: `You cannot add the wishlist to the event ${eventId}`,
            }),
          )

        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
      })

      it('should create wishlist successfully with one event', async () => {
        const {
          event: { id: eventId },
          eventDate,
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
        const response = await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              event_ids: [eventId],
            }),
          )
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              title: 'Test Wishlist',
              config: { hide_items: true },
              items: [],
              owner: {
                id: currentUserId,
                email: BASE_USER_EMAIL,
                firstname: 'John',
                lastname: 'Doe',
              },
              events: expect.toIncludeSameMembers([
                {
                  id: eventId,
                  title: 'Test Event',
                  description: 'Test Description',
                  event_date: eventDate.toISODate(),
                },
              ]),
              created_at: expect.toBeDateString(),
              updated_at: expect.toBeDateString(),
            })
          })

        const createdWishlistId = response.body.id

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: createdWishlistId,
          title: 'Test Wishlist',
          description: null,
          logo_url: null,
          hide_items: true,
          owner_id: currentUserId,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1).row(0).toEqual({
          event_id: eventId,
          wishlist_id: createdWishlistId,
        })
      })

      it('should create wishlist successfully with one event and full data', async () => {
        const {
          event: { id: eventId },
          eventDate,
        } = await factories.event.createWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
        const response = await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              description: 'Test Description',
              event_ids: [eventId],
              hide_items: false,
            }),
          )
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              title: 'Test Wishlist',
              description: 'Test Description',
              config: { hide_items: false },
              items: [],
              owner: {
                id: currentUserId,
                email: BASE_USER_EMAIL,
                firstname: 'John',
                lastname: 'Doe',
              },
              events: expect.toIncludeSameMembers([
                {
                  id: eventId,
                  title: 'Test Event',
                  description: 'Test Description',
                  event_date: eventDate.toISODate(),
                },
              ]),
              created_at: expect.toBeDateString(),
              updated_at: expect.toBeDateString(),
            })
          })

        const createdWishlistId = response.body.id

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: createdWishlistId,
          title: 'Test Wishlist',
          description: 'Test Description',
          logo_url: null,
          hide_items: false,
          owner_id: currentUserId,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1).row(0).toEqual({
          event_id: eventId,
          wishlist_id: createdWishlistId,
        })
      })

      it('should create wishlist with multiple events', async () => {
        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const response = await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              event_ids: [eventId1, eventId2],
            }),
          )
          .expect(201)

        const createdWishlistId = response.body.id

        await expectTable(Tables.EVENT_WISHLIST)
          .hasNumberOfRows(2)
          .row(0)
          .toEqual({
            event_id: eventId1,
            wishlist_id: createdWishlistId,
          })
          .row(1)
          .toEqual({
            event_id: eventId2,
            wishlist_id: createdWishlistId,
          })
      })
    })
  })

  describe('PUT /wishlist/:id', () => {
    const path = (id: string) => `/wishlist/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .put(path(uuid()))
        .send({
          title: 'Updated Wishlist',
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

      it('should return 404 if wishlist does not exist', async () => {
        const nonExistentId = uuid()

        await request
          .put(path(nonExistentId))
          .send({
            title: 'Updated Title',
          })
          .expect(404)
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['title should not be empty'],
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
          },
          case: 'description too long',
          message: ['description must be shorter than or equal to 2000 characters'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Original Title',
        })

        await request
          .put(path(wishlistId))
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          )

        // Verify no changes were made
        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Original Title',
        })
      })

      it('should return 401 when user is not owner', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event title',
          description: 'Event description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Original Title',
        })

        await request
          .put(path(wishlistId))
          .send({
            title: 'Updated Title',
          })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Unauthorized', message: 'You cannot modify this wishlist' }),
          )

        // Verify no changes were made
        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Original Title',
        })
      })

      it('should update wishlist successfully with title', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event title',
          description: 'Event description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Original Title',
          description: 'Original Description',
        })

        await request
          .put(path(wishlistId))
          .send({
            title: 'Updated Title',
          })
          .expect(200)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Updated Title',
          description: null,
          updated_at: expect.toBeDate(),
        })
      })

      it('should update wishlist successfully with title and description', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event title',
          description: 'Event description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Wishlist Title',
          description: 'Wishlist Description',
        })

        await request
          .put(path(wishlistId))
          .send({
            title: 'Updated wishlist title',
            description: 'Updated wishlist description',
          })
          .expect(200)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Updated wishlist title',
          description: 'Updated wishlist description',
          updated_at: expect.toBeDate(),
        })
      })

      it('should allow co-owner to update wishlist', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Original Title',
          hideItems: false,
          coOwnerId: currentUserId,
        })

        await request
          .put(path(wishlistId))
          .send({
            title: 'Updated by Co-Owner',
            description: 'Updated description',
          })
          .expect(200)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Updated by Co-Owner',
          description: 'Updated description',
        })
      })
    })
  })

  describe('DELETE /wishlist/:id', () => {
    const path = (id: string) => `/wishlist/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.delete(path(uuid())).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await factories.getSignedUserId('BASE_USER')
      })

      it('should return 404 if wishlist does not exist', async () => {
        const nonExistentId = uuid()

        await request.delete(path(nonExistentId)).expect(404)
      })

      it('should return 401 when user is not owner or co-owner', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Other Wishlist',
        })

        await request
          .delete(path(wishlistId))
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'Only the owner or co-owner of the list can delete it',
            }),
          )

        // Verify wishlist still exists
        await expectTable(Tables.WISHLIST).hasNumberOfRows(1)
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should delete wishlist successfully', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Test Wishlist',
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1)
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
        await request.delete(path(wishlistId)).expect(200)

        // Verify wishlist and its relations are deleted
        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(0)
      })

      it('should delete wishlist with multiple events successfully', async () => {
        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1, eventId2],
          ownerId: currentUserId,
          title: 'Test Wishlist',
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1)
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(2)
        await expectTable(Tables.EVENT).hasNumberOfRows(2)
        await request.delete(path(wishlistId)).expect(200)

        // Verify wishlist and its relations are deleted
        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(0)
        await expectTable(Tables.EVENT).hasNumberOfRows(2)
      })

      it('should delete wishlist with items successfully', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Test Wishlist',
        })

        await factories.item.create({
          wishlistId,
          name: 'Test Item',
          description: 'Test Description',
          isSuggested: false,
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1)
        await expectTable(Tables.ITEM).hasNumberOfRows(1)
        await request.delete(path(wishlistId)).expect(200)

        // Verify wishlist and its items are deleted
        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
        await expectTable(Tables.ITEM).hasNumberOfRows(0)
      })

      it('should allow co-owner to delete wishlist', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Wishlist to Delete',
          hideItems: false,
          coOwnerId: currentUserId,
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1)
        await request.delete(path(wishlistId)).expect(200)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(0)
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(0)
      })
    })
  })

  describe('POST /wishlist/:id/link-event', () => {
    const path = (id: string) => `/wishlist/${id}/link-event`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .post(path(uuid()))
        .send({
          event_id: uuid(),
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

      it('should return 404 if wishlist does not exist', async () => {
        const nonExistentId = uuid()
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await request
          .post(path(nonExistentId))
          .send({
            event_id: eventId,
          })
          .expect(404)
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['event_id should not be empty'],
        },
        {
          body: { event_id: '' },
          case: 'empty event_id',
          message: ['event_id should not be empty'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Test Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          )

        // Verify no new event-wishlist relations were created
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should return 401 when user is not owner or co-owner of wishlist', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: otherUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1],
          ownerId: otherUserId,
          title: 'Other Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send({
            event_id: eventId2,
          })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'Only the owner or co-owner of the list can update it',
            }),
          )

        // Verify no new event-wishlist relations were created
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should return 401 when user is not attendee of event', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1],
          ownerId: currentUserId,
          title: 'My Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send({ event_id: eventId2 })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Unauthorized', message: 'You cannot add the wishlist to this event' }),
          )

        // Verify no new event-wishlist relations were created
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should link wishlist to event successfully', async () => {
        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1],
          ownerId: currentUserId,
          title: 'My Wishlist',
        })

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
        await request.post(path(wishlistId)).send({ event_id: eventId2 }).expect(201)

        // Verify new event-wishlist relation was created
        await expectTable(Tables.EVENT_WISHLIST)
          .hasNumberOfRows(2)
          .row(0)
          .toEqual({
            event_id: eventId1,
            wishlist_id: wishlistId,
          })
          .row(1)
          .toEqual({
            event_id: eventId2,
            wishlist_id: wishlistId,
          })
      })

      it('should link wishlist to event when user is attendee', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: otherUserId,
        })

        // Make current user an attendee of event 2
        await factories.eventAttendee.create({
          eventId: eventId2,
          userId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1],
          ownerId: currentUserId,
          title: 'My Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send({
            event_id: eventId2,
          })
          .expect(201)

        // Verify new event-wishlist relation was created
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(2)
      })

      it('should return 400 when wishlist is already linked to event', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'My Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send({
            event_id: eventId,
          })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: 'Wishlist is already linked to this event',
            }),
          )

        // Verify no new event-wishlist relations were created
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should allow co-owner to link wishlist to event', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: otherUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1],
          ownerId: otherUserId,
          title: 'Co-Owned Wishlist',
          hideItems: false,
          coOwnerId: currentUserId,
        })

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
        await request.post(path(wishlistId)).send({ event_id: eventId2 }).expect(201)

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(2)
      })
    })
  })

  describe('POST /wishlist/:id/unlink-event', () => {
    const path = (id: string) => `/wishlist/${id}/unlink-event`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .post(path(uuid()))
        .send({
          event_id: uuid(),
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

      it('should return 404 if wishlist does not exist', async () => {
        const nonExistentId = uuid()
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await request
          .post(path(nonExistentId))
          .send({
            event_id: eventId,
          })
          .expect(404)
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['event_id should not be empty'],
        },
        {
          body: { event_id: '' },
          case: 'empty event_id',
          message: ['event_id should not be empty'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Test Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          )

        // Verify event-wishlist relation still exists
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should return 401 when user is not owner or co-owner of wishlist', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Other Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send({
            event_id: eventId,
          })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'Only the owner or co-owner of the list can update it',
            }),
          )

        // Verify event-wishlist relation still exists
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should unlink wishlist from event successfully', async () => {
        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1, eventId2],
          ownerId: currentUserId,
          title: 'My Wishlist',
        })

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(2)
        await request.post(path(wishlistId)).send({ event_id: eventId2 }).expect(201)

        // Verify event-wishlist relation was removed
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1).row(0).toEqual({
          event_id: eventId1,
          wishlist_id: wishlistId,
        })
      })

      it('should return 400 when wishlist is not linked to event', async () => {
        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1, eventId2],
          ownerId: currentUserId,
          title: 'My Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send({
            event_id: uuid(),
          })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: 'Wishlist is not linked to this event',
            }),
          )

        // Verify original event-wishlist relation still exists
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(2)
      })

      it('should return 400 when trying to unlink the last event', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'My Wishlist',
        })

        await request
          .post(path(wishlistId))
          .send({
            event_id: eventId,
          })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: 'A wishlist must be linked to at least one event. Delete the wishlist instead.',
            }),
          )

        // Verify event-wishlist relation still exists
        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })

      it('should allow co-owner to unlink wishlist from event', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const {
          event: { id: eventId1 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: otherUserId,
        })

        const {
          event: { id: eventId2 },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId1, eventId2],
          ownerId: otherUserId,
          title: 'Co-Owned Wishlist',
          hideItems: false,
          coOwnerId: currentUserId,
        })

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(2)
        await request.post(path(wishlistId)).send({ event_id: eventId2 }).expect(201)

        await expectTable(Tables.EVENT_WISHLIST).hasNumberOfRows(1)
      })
    })
  })

  describe('POST /wishlist/:id/co-owner', () => {
    const path = (id: string) => `/wishlist/${id}/co-owner`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request
        .post(path(uuid()))
        .send({
          user_id: uuid(),
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

      it('should return 404 if wishlist does not exist', async () => {
        const nonExistentId = uuid()
        const { id: coOwnerId } = await factories.user.create({
          email: 'coowner@test.com',
          firstName: 'CoOwner',
          lastName: 'User',
        })

        await request
          .post(path(nonExistentId))
          .send({
            user_id: coOwnerId,
          })
          .expect(404)
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['user_id should not be empty'],
        },
        {
          body: { user_id: '' },
          case: 'empty user_id',
          message: ['user_id should not be empty'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
        })

        await request
          .post(path(wishlistId))
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          )

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })
      })

      it('should return 401 when user is not the owner', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const { id: coOwnerId } = await factories.user.create({
          email: 'coowner@test.com',
          firstName: 'CoOwner',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Other Public Wishlist',
          hideItems: false,
        })

        await request
          .post(path(wishlistId))
          .send({
            user_id: coOwnerId,
          })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Unauthorized', message: 'Only the owner can add a co-owner' }),
          )

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })
      })

      it('should return 400 when trying to add co-owner to private list', async () => {
        const { id: coOwnerId } = await factories.user.create({
          email: 'coowner@test.com',
          firstName: 'CoOwner',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Private Wishlist',
          hideItems: true,
        })

        await request
          .post(path(wishlistId))
          .send({
            user_id: coOwnerId,
          })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: 'Cannot add co-owner to private lists' }),
          )

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })
      })

      it('should return 400 when trying to add owner as co-owner', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
        })

        await request
          .post(path(wishlistId))
          .send({
            user_id: currentUserId,
          })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: 'Cannot add the owner as co-owner' }),
          )

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })
      })

      it('should add co-owner successfully to public wishlist', async () => {
        const { id: coOwnerId } = await factories.user.create({
          email: 'coowner@test.com',
          firstName: 'CoOwner',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })

        await request
          .post(path(wishlistId))
          .send({
            user_id: coOwnerId,
          })
          .expect(201)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: coOwnerId,
          updated_at: expect.toBeDate(),
        })
      })

      it('should replace existing co-owner when adding a new one', async () => {
        const { id: coOwnerId1 } = await factories.user.create({
          email: 'coowner1@test.com',
          firstName: 'CoOwner1',
          lastName: 'User',
        })

        const { id: coOwnerId2 } = await factories.user.create({
          email: 'coowner2@test.com',
          firstName: 'CoOwner2',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
          coOwnerId: coOwnerId1,
        })

        await request
          .post(path(wishlistId))
          .send({
            user_id: coOwnerId2,
          })
          .expect(201)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: coOwnerId2,
        })
      })
    })
  })

  describe('DELETE /wishlist/:id/co-owner', () => {
    const path = (id: string) => `/wishlist/${id}/co-owner`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.delete(path(uuid())).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await factories.getSignedUserId('BASE_USER')
      })

      it('should return 404 if wishlist does not exist', async () => {
        const nonExistentId = uuid()

        await request.delete(path(nonExistentId)).expect(404)
      })

      it('should return 401 when user is not the owner', async () => {
        const { id: otherUserId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        const { id: coOwnerId } = await factories.user.create({
          email: 'coowner@test.com',
          firstName: 'CoOwner',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: otherUserId,
          title: 'Other Public Wishlist',
          hideItems: false,
          coOwnerId,
        })

        await request
          .delete(path(wishlistId))
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Unauthorized', message: 'Only the owner can remove the co-owner' }),
          )

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: coOwnerId,
        })
      })

      it('should remove co-owner successfully', async () => {
        const { id: coOwnerId } = await factories.user.create({
          email: 'coowner@test.com',
          firstName: 'CoOwner',
          lastName: 'User',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
          coOwnerId,
        })

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: coOwnerId,
        })

        await request.delete(path(wishlistId)).expect(200)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
          updated_at: expect.toBeDate(),
        })
      })

      it('should succeed even when no co-owner exists', async () => {
        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const { id: wishlistId } = await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
        })

        await request.delete(path(wishlistId)).expect(200)

        await expectTable(Tables.WISHLIST).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })
      })
    })
  })
  // TODO: create later when we are able to mock and assert file upload
  // POST /wishlist/:id/upload-logo
  // DELETE /wishlist/:id/logo
})
