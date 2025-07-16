import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { AttendeeRole, uuid } from '@wishlist/common'

describe('ItemController', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
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

        await expectTable(Fixtures.ITEM_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
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
          .check()
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

        await expectTable(Fixtures.ITEM_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
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
          .check()
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

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0).check()
      })

      it('should return 404 when user does not have access to wishlist', async () => {
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
          .expect(404)
          .expect(({ body }) => {
            expect(body).toMatchObject({
              error: 'Not Found',
              message: 'Wishlist not found',
            })
          })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0).check()
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

        await expectTable(Fixtures.ITEM_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: response.body.id,
            name: 'Suggested Item',
            is_suggested: true,
            wishlist_id: wishlistId,
            created_at: expect.toBeDate(),
            updated_at: expect.toBeDate(),
          })
          .check()
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

        await expectTable(Fixtures.ITEM_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: itemId,
            name: 'Updated Item',
            description: 'Updated description',
            url: 'https://updated.com',
            score: 5,
            picture_url: 'https://updated.com/pic.jpg',
            updated_at: expect.toBeDate(),
          })
          .check()
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

      it('should return 404 when user does not have access to item', async () => {
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

        await request.put(path(itemId)).send({ name: 'Updated Item' }).expect(404)

        // Verify no changes were made
        await expectTable(Fixtures.ITEM_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: itemId,
            name: 'Test Item',
          })
          .check()
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

        await expectTable(Fixtures.ITEM_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: itemId,
            name: 'Suggested Item',
          })
          .check()
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
    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      // TODO: Implement test
    })

    describe('when user is authenticated', () => {
      let request: any
      let fixtures: any
      let currentUserId: string

      beforeEach(async () => {
        fixtures = await getFixtures()
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should delete item successfully', async () => {
        // TODO: Implement test
      })

      it('should return 404 when item not found', async () => {
        // TODO: Implement test
      })

      it('should return 404 when user does not have access to item', async () => {
        // TODO: Implement test
      })

      it('should return 404 when trying to delete suggested item as list owner', async () => {
        // TODO: Implement test
      })

      it('should return 401 when trying to delete suggested item taken by someone else', async () => {
        // TODO: Implement test
      })

      it('should return 401 when trying to delete non-suggested item as non-owner', async () => {
        // TODO: Implement test
      })

      it('should convert to suggested item when deleting taken non-suggested item', async () => {
        // TODO: Implement test
      })
    })
  })

  describe('POST /item/:id/toggle', () => {
    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      // TODO: Implement test
    })

    describe('when user is authenticated', () => {
      let request: any
      let fixtures: any
      let currentUserId: string

      beforeEach(async () => {
        fixtures = await getFixtures()
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should toggle item (check) successfully', async () => {
        // TODO: Implement test
      })

      it('should toggle item (uncheck) successfully', async () => {
        // TODO: Implement test
      })

      it('should return 404 when item not found', async () => {
        // TODO: Implement test
      })

      it('should return 404 when user does not have access to item', async () => {
        // TODO: Implement test
      })

      it('should return 404 when trying to check suggested item as list owner with hideItems', async () => {
        // TODO: Implement test
      })

      it('should return 401 when trying to check own items as list owner with hideItems', async () => {
        // TODO: Implement test
      })

      it('should return 401 when trying to uncheck item taken by someone else', async () => {
        // TODO: Implement test
      })

      it('should return 401 when trying to uncheck own items as list owner with hideItems', async () => {
        // TODO: Implement test
      })
    })
  })
})
