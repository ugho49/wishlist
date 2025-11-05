import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { addDays, AttendeeRole, subtractMonths, uuid } from '@wishlist/common'

describe('ItemController', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('GET /item/importable', () => {
    const path = (wishlistId: string) => `/item/importable?wishlist_id=${wishlistId}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      const wishlistId = uuid()
      await request.get(path(wishlistId)).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return empty array when user has no old wishlists', async () => {
        // Create a target wishlist for the query parameter
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        const response = await request.get(path(targetWishlistId)).expect(200)
        expect(response.body).toEqual([])
      })

      it('should return empty array when old wishlists have no items', async () => {
        // Create target wishlist
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        // Create event finished more than 2 months ago
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        // Create wishlist linked to old event
        await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        const response = await request.get(path(targetWishlistId)).expect(200)
        expect(response.body).toEqual([])
      })

      it('should return importable items from old wishlists', async () => {
        // Create target wishlist
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        // Create event finished more than 2 months ago
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        // Create wishlist linked to old event
        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        // Create items - one not taken, one taken, one suggested
        const notTakenItemId = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Not Taken Item',
          description: 'Should be importable',
        })

        await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Taken Item',
          description: 'Should not be importable',
          takerId: currentUserId,
          takenAt: new Date(),
        })

        await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Suggested Item',
          description: 'Should not be importable',
          isSuggested: true,
        })

        const response = await request.get(path(targetWishlistId)).expect(200)

        expect(response.body).toHaveLength(1)
        expect(response.body[0]).toMatchObject({
          id: notTakenItemId,
          name: 'Not Taken Item',
          description: 'Should be importable',
        })
      })

      it('should not return items from wishlists with events finished less than 2 months ago', async () => {
        // Create target wishlist
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        // Create event finished 1 month ago (less than 2 months)
        const recentEventDate = subtractMonths(new Date(), 1)
        const { eventId: recentEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Recent Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: recentEventDate,
        })

        // Create wishlist linked to recent event
        const recentWishlistId = await fixtures.insertWishlist({
          eventIds: [recentEventId],
          userId: currentUserId,
          title: 'Recent Wishlist',
        })

        await fixtures.insertItem({
          wishlistId: recentWishlistId,
          name: 'Recent Item',
          description: 'Should not be importable',
        })

        const response = await request.get(path(targetWishlistId)).expect(200)
        expect(response.body).toEqual([])
      })

      it('should not return items from wishlists with at least one event not finished more than 2 months ago', async () => {
        // Create target wishlist
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        // Create one old event and one recent event
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        const recentEventDate = subtractMonths(new Date(), 1)
        const { eventId: recentEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Recent Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: recentEventDate,
        })

        // Create wishlist linked to both events (one old, one recent)
        const mixedWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId, recentEventId],
          userId: currentUserId,
          title: 'Mixed Wishlist',
        })

        await fixtures.insertItem({
          wishlistId: mixedWishlistId,
          name: 'Mixed Event Item',
          description: 'Should not be importable because one event is recent',
        })

        const response = await request.get(path(targetWishlistId)).expect(200)
        expect(response.body).toEqual([])
      })

      it('should only return items from current user wishlists', async () => {
        // Create target wishlist
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        // Create another user
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        // Create old event for other user
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: otherEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          description: 'Description',
          maintainerId: otherUserId,
          eventDate: oldEventDate,
        })

        // Create wishlist for other user
        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [otherEventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        await fixtures.insertItem({
          wishlistId: otherWishlistId,
          name: 'Other User Item',
          description: 'Should not be importable',
        })

        const response = await request.get(path(targetWishlistId)).expect(200)
        expect(response.body).toEqual([])
      })

      it('should return multiple importable items ordered by creation date', async () => {
        // Create target wishlist
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        // Create event finished more than 2 months ago
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        // Create wishlist linked to old event
        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        // Create multiple items
        const item1Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 1',
        })

        const item2Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 2',
        })

        const item3Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 3',
        })

        const response = await request.get(path(targetWishlistId)).expect(200)

        expect(response.body).toHaveLength(3)
        // biome-ignore lint/suspicious/noExplicitAny: normal for test
        expect(response.body.map((item: any) => item.id)).toEqual([item1Id, item2Id, item3Id])
      })
    })
  })

  describe('POST /item/import', () => {
    const path = '/item/import'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      await request
        .post(path)
        .send({
          wishlist_id: uuid(),
          source_item_ids: [uuid()],
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
          message: ['wishlist_id should not be empty', 'source_item_ids must be an array'],
        },
        {
          body: { wishlist_id: uuid() },
          case: 'missing source_item_ids',
          message: ['source_item_ids must be an array'],
        },
        {
          body: { wishlist_id: uuid(), source_item_ids: [] },
          case: 'empty source_item_ids array',
          message: ['source_item_ids should not be empty'],
        },
        {
          body: { wishlist_id: uuid(), source_item_ids: [true, 1] },
          case: 'source_item_ids not an array of strings',
          message: ['each value in source_item_ids must be a string'],
        },
        {
          body: { source_item_ids: [uuid()] },
          case: 'missing wishlist_id',
          message: ['wishlist_id should not be empty'],
        },
        {
          body: { wishlist_id: uuid(), source_item_ids: 'not-an-array' },
          case: 'source_item_ids not an array',
          message: ['source_item_ids must be an array'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        await request
          .post(path)
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: expect.arrayContaining(message),
            }),
          )
      })

      it('should return 404 when target wishlist not found', async () => {
        const nonExistentWishlistId = uuid()

        await request
          .post(path)
          .send({
            wishlist_id: nonExistentWishlistId,
            source_item_ids: [uuid()],
          })
          .expect(404)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Not Found',
              message: 'Wishlist not found',
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should successfully import multiple items from old wishlists', async () => {
        // Create old event (more than 2 months ago)
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        // Create old wishlist
        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        // Create importable items
        const item1Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 1',
          description: 'Description 1',
          url: 'https://example1.com',
          score: 3,
          pictureUrl: 'https://example1.com/pic.jpg',
        })

        const item2Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 2',
          description: 'Description 2',
          url: 'https://example2.com',
          score: 5,
        })

        // Create new event
        const newEventDate = addDays(new Date(), 30)
        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: newEventDate,
        })

        // Create target wishlist
        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        const response = await request
          .post(path)
          .send({
            wishlist_id: targetWishlistId,
            source_item_ids: [item1Id, item2Id],
          })
          .expect(201)

        expect(response.body).toHaveLength(2)
        expect(response.body[0]).toMatchObject({
          id: expect.toBeString(),
          name: 'Item 1',
          description: 'Description 1',
          url: 'https://example1.com',
          score: 3,
          picture_url: 'https://example1.com/pic.jpg',
          created_at: expect.toBeDateString(),
        })
        expect(response.body[1]).toMatchObject({
          id: expect.toBeString(),
          name: 'Item 2',
          description: 'Description 2',
          url: 'https://example2.com',
          score: 5,
          created_at: expect.toBeDateString(),
        })

        // Verify database - should have 4 items total (2 old + 2 imported)
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(4)
      })

      it('should return 401 when user does not have access to target wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        await request
          .post(path)
          .send({
            wishlist_id: otherWishlistId,
            source_item_ids: [uuid()],
          })
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot import items to this wishlist',
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return empty array when source items not found', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const nonExistentItemId = uuid()

        const response = await request
          .post(path)
          .send({
            wishlist_id: wishlistId,
            source_item_ids: [nonExistentItemId],
          })
          .expect(201)

        expect(response.body).toEqual([])
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return 401 when trying to import items from another user wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        // Create old event for other user
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: otherUserId,
          eventDate: oldEventDate,
        })

        // Create old wishlist for other user
        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: otherUserId,
          title: 'Other User Wishlist',
        })

        // Create item in other user's wishlist
        const itemId = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Other User Item',
          description: 'Should not be importable',
        })

        // Create target wishlist for current user
        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        await request
          .post(path)
          .send({
            wishlist_id: targetWishlistId,
            source_item_ids: [itemId],
          })
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot import items from another user wishlist',
            })
          })

        // Only the original item should exist
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })

      it('should return 500 when trying to import suggested items', async () => {
        // Create old event
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        // Create old wishlist
        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        // Create a suggested item
        const suggestedItemId = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Suggested Item',
          isSuggested: true,
        })

        // Create target wishlist
        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        await request
          .post(path)
          .send({
            wishlist_id: targetWishlistId,
            source_item_ids: [suggestedItemId],
          })
          .expect(500)

        // Only the original item should exist
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })

      it('should import taken items without their taken status', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        // Create old event
        const oldEventDate = subtractMonths(new Date(), 3)
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          description: 'Description',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        await fixtures.insertActiveAttendee({
          eventId: oldEventId,
          userId: otherUserId,
          role: AttendeeRole.USER,
        })

        // Create old wishlist
        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        // Create one regular item and one taken item
        const regularItemId = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Regular Item',
        })

        const takenItemId = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Taken Item',
          takerId: otherUserId,
          takenAt: new Date(),
        })

        // Create target wishlist
        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        const response = await request
          .post(path)
          .send({
            wishlist_id: targetWishlistId,
            source_item_ids: [regularItemId, takenItemId],
          })
          .expect(201)

        // Should import both items
        expect(response.body).toHaveLength(2)
        expect(response.body[0]).toMatchObject({
          name: 'Regular Item',
        })
        expect(response.body[1]).toMatchObject({
          name: 'Taken Item',
        })

        // Verify database - should have 4 items (2 old + 2 imported)
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(4)
      })
    })
  })

  describe('POST /item', () => {
    const path = '/item'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      await request
        .post(path)
        .send({
          wishlist_id: uuid(),
          name: 'Test Item',
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

      it('should create item successfully for own wishlist', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemData = {
          wishlist_id: wishlistId,
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          picture_url: 'https://example.com/pic.jpg',
        }

        const response = await request
          .post(path)
          .send(itemData)
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              name: 'Test Item',
              description: 'Test description',
              url: 'https://example.com',
              score: 5,
              picture_url: 'https://example.com/pic.jpg',
              is_suggested: false,
              created_at: expect.toBeDateString(),
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: response.body.id,
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          picture_url: 'https://example.com/pic.jpg',
          is_suggested: false,
          wishlist_id: wishlistId,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })
      })

      it('should create item successfully for other user wishlist and mark it as suggested', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'My Wishlist',
        })

        const itemData = {
          wishlist_id: wishlistId,
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          picture_url: 'https://example.com/pic.jpg',
        }

        const response = await request
          .post(path)
          .send(itemData)
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              name: 'Test Item',
              description: 'Test description',
              url: 'https://example.com',
              score: 5,
              picture_url: 'https://example.com/pic.jpg',
              is_suggested: true,
              created_at: expect.toBeDateString(),
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: response.body.id,
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          picture_url: 'https://example.com/pic.jpg',
          is_suggested: true,
          wishlist_id: wishlistId,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['wishlist_id should not be empty', 'name should not be empty'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: '' },
          case: 'empty name',
          message: ['name should not be empty'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'a'.repeat(41) },
          case: 'name too long',
          message: ['name must be shorter than or equal to 40 characters'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', description: 'a'.repeat(61) },
          case: 'description too long',
          message: ['description must be shorter than or equal to 60 characters'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', url: 'invalid-url' },
          case: 'invalid url',
          message: ['url must be a URL address'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', url: `https://www.${'a'.repeat(1000)}.com` },
          case: 'url too long',
          message: ['url must be shorter than or equal to 1000 characters'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', score: -1 },
          case: 'score too low',
          message: ['score must not be less than 0'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', score: 6 },
          case: 'score too high',
          message: ['score must not be greater than 5'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', score: 3.5 },
          case: 'score not integer',
          message: ['score must be an integer number'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', picture_url: 'invalid-url' },
          case: 'invalid picture_url',
          message: ['picture_url must be a URL address'],
        },
        {
          body: { wishlist_id: 'valid-uuid', name: 'Item Name', picture_url: `https://www.${'a'.repeat(1000)}.jpg` },
          case: 'picture_url too long',
          message: ['picture_url must be shorter than or equal to 1000 characters'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        await request
          .post(path)
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: expect.arrayContaining(message),
            }),
          )
      })

      it('should return 404 when wishlist not found', async () => {
        const nonExistentWishlistId = uuid()

        await request
          .post(path)
          .send({
            wishlist_id: nonExistentWishlistId,
            name: 'Test Item',
          })
          .expect(404)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Not Found',
              message: 'Wishlist not found',
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return 401 when user does not have access to wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        await request
          .post(path)
          .send({
            wishlist_id: wishlistId,
            name: 'Test Item',
          })
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot add items to this wishlist',
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should create suggested item when user is not wishlist owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemData = {
          wishlist_id: wishlistId,
          name: 'Suggested Item',
        }

        const response = await request
          .post(path)
          .send(itemData)
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              name: 'Suggested Item',
              is_suggested: true,
              created_at: expect.toBeDateString(),
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: response.body.id,
          name: 'Suggested Item',
          is_suggested: true,
          wishlist_id: wishlistId,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })
      })
    })
  })

  describe('PUT /item/:id', () => {
    const path = (id: string) => `/item/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      const itemId = uuid()
      await request.put(path(itemId)).send({ name: 'Updated Item' }).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should update item successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Original Item',
          description: 'Original description',
          url: 'https://original.com',
          score: 3,
        })

        const updateData = {
          name: 'Updated Item',
          description: 'Updated description',
          url: 'https://updated.com',
          score: 5,
          picture_url: 'https://updated.com/pic.jpg',
        }

        await request.put(path(itemId)).send(updateData).expect(200)

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Updated Item',
          description: 'Updated description',
          url: 'https://updated.com',
          score: 5,
          picture_url: 'https://updated.com/pic.jpg',
          updated_at: expect.toBeDate(),
        })
      })

      it.each([
        {
          body: { name: '' },
          case: 'empty name',
          message: ['name should not be empty'],
        },
        {
          body: { name: 'a'.repeat(41) },
          case: 'name too long',
          message: ['name must be shorter than or equal to 40 characters'],
        },
        {
          body: { name: 'Item Name', description: 'a'.repeat(61) },
          case: 'description too long',
          message: ['description must be shorter than or equal to 60 characters'],
        },
        {
          body: { name: 'Item Name', url: 'invalid-url' },
          case: 'invalid url',
          message: ['url must be a URL address'],
        },
        {
          body: { name: 'Item Name', url: `https://www.${'a'.repeat(1000)}.com` },
          case: 'url too long',
          message: ['url must be shorter than or equal to 1000 characters'],
        },
        {
          body: { name: 'Item Name', score: -1 },
          case: 'score too low',
          message: ['score must not be less than 0'],
        },
        {
          body: { name: 'Item Name', score: 6 },
          case: 'score too high',
          message: ['score must not be greater than 5'],
        },
        {
          body: { name: 'Item Name', score: 3.5 },
          case: 'score not integer',
          message: ['score must be an integer number'],
        },
        {
          body: { name: 'Item Name', picture_url: 'invalid-url' },
          case: 'invalid picture_url',
          message: ['picture_url must be a URL address'],
        },
        {
          body: { name: 'Item Name', picture_url: `https://www.${'a'.repeat(1000)}.jpg` },
          case: 'picture_url too long',
          message: ['picture_url must be shorter than or equal to 1000 characters'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
        })

        await request
          .put(path(itemId))
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: expect.arrayContaining(message),
            }),
          )
      })

      it('should return 404 when item not found', async () => {
        const nonExistentItemId = uuid()

        await request.put(path(nonExistentItemId)).send({ name: 'Updated Item' }).expect(404)
      })

      it('should return 401 when user does not have access to item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
        })

        await request.put(path(itemId)).send({ name: 'Updated Item' }).expect(401)

        // Verify no changes were made
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Test Item',
        })
      })

      it('should return 404 when trying to update suggested item as list owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Suggested Item',
          isSuggested: true,
        })

        await request.put(path(itemId)).send({ name: 'Updated Item' }).expect(404)

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Suggested Item',
        })
      })

      it('should return 401 when trying to update suggested item taken by someone else', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const thirdUserId = await fixtures.insertUser({
          email: 'third@test.com',
          firstname: 'Third',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: thirdUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Suggested Item',
          isSuggested: true,
          takerId: thirdUserId,
          takenAt: new Date(),
        })

        await request
          .put(path(itemId))
          .send({ name: 'Updated Item' })
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot update this item, is already take by someone else',
            })
          })
      })

      it('should return 401 when trying to update non-suggested item as non-owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Regular Item',
          isSuggested: false,
        })

        await request
          .put(path(itemId))
          .send({ name: 'Updated Item' })
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot update this item, only the creator of the list can',
            })
          })
      })
    })
  })

  describe('DELETE /item/:id', () => {
    const path = (id: string) => `/item/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      const itemId = uuid()
      await request.delete(path(itemId)).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should delete item successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
          description: 'Test description',
        })

        await request.delete(path(itemId)).expect(200)

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return 404 when item not found', async () => {
        const nonExistentItemId = uuid()

        await request.delete(path(nonExistentItemId)).expect(404)
      })

      it('should return 401 when user does not have access to item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
        })

        await request.delete(path(itemId)).expect(401)

        // Verify item still exists
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })

      it('should return 401 when trying to delete suggested item as list owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Suggested Item',
          isSuggested: true,
        })

        await request.delete(path(itemId)).expect(401)

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })

      it('should return 401 when trying to delete suggested item taken by someone else', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const thirdUserId = await fixtures.insertUser({
          email: 'third@test.com',
          firstname: 'Third',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: thirdUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Suggested Item',
          isSuggested: true,
          takerId: thirdUserId,
          takenAt: new Date(),
        })

        await request
          .delete(path(itemId))
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot delete this item, is already taken',
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })

      it('should return 401 when trying to delete non-suggested item as non-owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Regular Item',
          isSuggested: false,
        })

        await request
          .delete(path(itemId))
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot delete this item, only the creator of the list can',
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })

      it('should convert to suggested item when deleting taken non-suggested item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const takenAt = new Date()

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Taken Item',
          isSuggested: false,
          takerId: otherUserId,
          takenAt,
        })

        await request.delete(path(itemId)).expect(200)

        // Verify item is converted to suggested instead of deleted
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Taken Item',
          is_suggested: true,
          taker_id: otherUserId,
          taken_at: takenAt,
        })
      })
    })
  })

  describe('POST /item/:id/toggle', () => {
    const path = (id: string) => `/item/${id}/toggle`

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      const itemId = uuid()
      await request.post(path(itemId)).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should toggle item (check) successfully', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
          isSuggested: false,
        })

        await request
          .post(path(itemId))
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              taken_by: {
                id: currentUserId,
                email: 'test@test.fr',
                firstname: 'John',
                lastname: 'Doe',
              },
              taken_at: expect.toBeDateString(),
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Test Item',
          taker_id: currentUserId,
          taken_at: expect.toBeDate(),
        })
      })

      it('should toggle item (uncheck) successfully', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
          isSuggested: false,
          takerId: currentUserId,
          takenAt: new Date(),
        })

        await request
          .post(path(itemId))
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({})
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Test Item',
          taker_id: null,
          taken_at: null,
        })
      })

      it('should return 404 when item not found', async () => {
        const nonExistentItemId = uuid()

        await request.post(path(nonExistentItemId)).expect(404)
      })

      it('should return 401 when user does not have access to item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
        })

        await request.post(path(itemId)).expect(401)
      })

      it('should return 404 when trying to check suggested item as list owner with hideItems', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: otherUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
          hideItems: true,
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Suggested Item',
          isSuggested: true,
        })

        await request.post(path(itemId)).expect(404)
      })

      it('should return 401 when trying to check own items as list owner with hideItems', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
          hideItems: true,
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'My Item',
          isSuggested: false,
        })

        await request
          .post(path(itemId))
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot check your own items',
            })
          })
      })

      it('should return 401 when trying to uncheck item taken by someone else', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const thirdUserId = await fixtures.insertUser({
          email: 'third@test.com',
          firstname: 'Third',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: otherUserId,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.USER,
        })

        await fixtures.insertActiveAttendee({
          eventId,
          userId: thirdUserId,
          role: AttendeeRole.USER,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
          isSuggested: false,
          takerId: thirdUserId,
          takenAt: new Date(),
        })

        await request
          .post(path(itemId))
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot uncheck this item, you are not the one who as check it',
            })
          })
      })

      it('should return 401 when trying to uncheck own items as list owner with hideItems', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Description',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
          hideItems: true,
        })

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'My Item',
          isSuggested: false,
          takerId: currentUserId,
          takenAt: new Date(),
        })

        await request
          .post(path(itemId))
          .expect(401)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: 'You cannot uncheck your own items',
            })
          })
      })
    })
  })
})
