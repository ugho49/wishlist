import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'

describe('WishlistMessageController', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('GET /wishlist-message', () => {
    const path = '/wishlist-message'

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      await unauthenticatedRequest.get(path).query({ wishlistId: uuid() }).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return empty messages array when no messages exist', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const otherUserId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })
        await fixtures.insertActiveAttendee({ eventId, userId: otherUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Test Wishlist',
        })

        await request
          .get(path)
          .query({ wishlistId })
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({
              messages: [],
              unread_count: 0,
            })
          })
      })

      it('should return paginated messages for a wishlist when user is participant (not owner)', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Test Wishlist',
        })

        await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: currentUserId,
          content: 'Hello from participant',
        })

        await request
          .get(path)
          .query({ wishlistId })
          .expect(200)
          .expect(({ body }) => {
            expect(body.messages).toHaveLength(1)
            expect(body.messages[0]).toMatchObject({
              id: expect.toBeString(),
              content: 'Hello from participant',
              author: {
                id: currentUserId,
                firstname: 'John',
                lastname: 'Doe',
                email: Fixtures.BASE_USER_EMAIL,
              },
              created_at: expect.toBeDateString(),
            })
            expect(body.unread_count).toBe(1)
          })
      })

      it('should return empty messages when user is the wishlist owner (hideItems=true)', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Test Wishlist',
          hideItems: true,
        })

        const participantId = await fixtures.insertUser({
          email: 'participant@test.fr',
          firstname: 'Participant',
          lastname: 'User',
        })
        await fixtures.insertActiveAttendee({ eventId, userId: participantId })

        await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: participantId,
          content: 'Secret message',
        })

        await request
          .get(path)
          .query({ wishlistId })
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({ messages: [], unread_count: 0 })
          })
      })

      it('should return messages when user is owner and hideItems=false', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Test Wishlist',
          hideItems: false,
        })

        const participantId = await fixtures.insertUser({
          email: 'participant@test.fr',
          firstname: 'Participant',
          lastname: 'User',
        })
        await fixtures.insertActiveAttendee({ eventId, userId: participantId })

        await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: participantId,
          content: 'Visible message',
        })

        await request
          .get(path)
          .query({ wishlistId })
          .expect(200)
          .expect(({ body }) => {
            expect(body.messages).toHaveLength(1)
            expect(body.messages[0]).toMatchObject({ content: 'Visible message' })
          })
      })

      it('should return 401 when user has no access to the wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.fr',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Private Wishlist',
        })

        await request.get(path).query({ wishlistId }).expect(401)
      })

      it('should return only unread_count when limit=0', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Test Wishlist',
        })

        await fixtures.insertWishlistMessage({ wishlistId, authorId: currentUserId, content: 'Msg 1' })
        await fixtures.insertWishlistMessage({ wishlistId, authorId: currentUserId, content: 'Msg 2' })

        await request
          .get(path)
          .query({ wishlistId, limit: 0 })
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({ messages: [], unread_count: 2 })
          })
      })

      it('should paginate with cursor and return messages in chronological order', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Test Wishlist',
        })

        // Insert messages with specific timestamps for deterministic ordering
        const baseTime = new Date('2025-01-01T12:00:00Z')
        for (let i = 0; i < 5; i++) {
          await fixtures.insertWishlistMessage({
            wishlistId,
            authorId: currentUserId,
            content: `Message ${i + 1}`,
            createdAt: new Date(baseTime.getTime() + i * 1000),
          })
        }

        // First page with limit=3 should return the 3 most recent messages in chronological order
        const firstPageResponse = await request.get(path).query({ wishlistId, limit: 3 }).expect(200)

        const firstPage = firstPageResponse.body
        expect(firstPage.messages).toHaveLength(3)
        // Messages should be in chronological order (oldest first)
        expect(firstPage.messages[0].content).toBe('Message 3')
        expect(firstPage.messages[1].content).toBe('Message 4')
        expect(firstPage.messages[2].content).toBe('Message 5')
        expect(firstPage.next_cursor).toBeString()

        // Second page using cursor
        const secondPageResponse = await request
          .get(path)
          .query({ wishlistId, limit: 3, cursor: firstPage.next_cursor })
          .expect(200)

        const secondPage = secondPageResponse.body
        expect(secondPage.messages).toHaveLength(2)
        expect(secondPage.messages[0].content).toBe('Message 1')
        expect(secondPage.messages[1].content).toBe('Message 2')
        // No more pages
        expect(secondPage.next_cursor).toBeUndefined()
      })

      it('should return correct unread_count based on last read timestamp', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Test Wishlist',
        })

        const readTime = new Date('2025-01-01T12:00:05Z')

        // Insert messages before and after read time
        await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: currentUserId,
          content: 'Old message',
          createdAt: new Date('2025-01-01T12:00:00Z'),
        })

        await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: currentUserId,
          content: 'New message 1',
          createdAt: new Date('2025-01-01T12:00:10Z'),
        })

        await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: currentUserId,
          content: 'New message 2',
          createdAt: new Date('2025-01-01T12:00:20Z'),
        })

        // Mark as read at a specific time
        await fixtures.insertWishlistMessageRead({
          userId: currentUserId,
          wishlistId,
          lastReadAt: readTime,
        })

        await request
          .get(path)
          .query({ wishlistId })
          .expect(200)
          .expect(({ body }) => {
            expect(body.messages).toHaveLength(3)
            expect(body.unread_count).toBe(2)
          })
      })
    })
  })

  describe('POST /wishlist-message', () => {
    const path = '/wishlist-message'

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      await unauthenticatedRequest.post(path).send({ wishlist_id: uuid(), content: 'Test' }).expect(401)
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
          message: ['content must be shorter than or equal to 500 characters', 'wishlist_id should not be empty'],
        },
        {
          body: { wishlist_id: uuid(), content: '' },
          case: 'empty content',
          message: ['content should not be empty'],
        },
        {
          body: { wishlist_id: uuid(), content: 'a'.repeat(501) },
          case: 'content too long',
          message: ['content must be shorter than or equal to 500 characters'],
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

      it('should create a message when user is a participant (not owner)', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: ownerId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: ownerId,
          title: 'Test Wishlist',
        })

        const response = await request
          .post(path)
          .send({ wishlist_id: wishlistId, content: 'My message' })
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              content: 'My message',
              author: {
                id: currentUserId,
                firstname: 'John',
                lastname: 'Doe',
                email: Fixtures.BASE_USER_EMAIL,
              },
              created_at: expect.toBeDateString(),
            })
          })

        await expectTable(Fixtures.WISHLIST_MESSAGE_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: response.body.id,
          wishlist_id: wishlistId,
          author_id: currentUserId,
          content: 'My message',
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })
      })

      it('should return 401 when user is owner of the wishlist (hideItems=true)', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
          hideItems: true,
        })

        await request.post(path).send({ wishlist_id: wishlistId, content: 'My message' }).expect(401)

        await expectTable(Fixtures.WISHLIST_MESSAGE_TABLE).hasNumberOfRows(0)
      })

      it('should return 401 when user has no access to the wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.fr',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Private Wishlist',
        })

        await request.post(path).send({ wishlist_id: wishlistId, content: 'My message' }).expect(401)

        await expectTable(Fixtures.WISHLIST_MESSAGE_TABLE).hasNumberOfRows(0)
      })
    })
  })

  describe('PUT /wishlist-message/read', () => {
    const path = '/wishlist-message/read'

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      await unauthenticatedRequest.put(path).send({ wishlist_id: uuid() }).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should mark messages as read for the current user', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: ownerId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: ownerId,
          title: 'Test Wishlist',
        })

        await request.put(path).send({ wishlist_id: wishlistId }).expect(200)

        await expectTable(Fixtures.WISHLIST_MESSAGE_READ_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          user_id: currentUserId,
          wishlist_id: wishlistId,
          last_read_at: expect.toBeDate(),
        })
      })

      it('should update existing read timestamp on subsequent calls', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: ownerId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: ownerId,
          title: 'Test Wishlist',
        })

        // Insert a past read timestamp
        const pastTime = new Date('2020-01-01T00:00:00Z')
        await fixtures.insertWishlistMessageRead({
          userId: currentUserId,
          wishlistId,
          lastReadAt: pastTime,
        })

        // Mark as read again
        await request.put(path).send({ wishlist_id: wishlistId }).expect(200)

        // Should still be 1 row but with updated timestamp
        await expectTable(Fixtures.WISHLIST_MESSAGE_READ_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          user_id: currentUserId,
          wishlist_id: wishlistId,
          last_read_at: expect.toBeDate(),
        })
      })

      it('should return 401 when user has no access to the wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.fr',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Private Wishlist',
        })

        await request.put(path).send({ wishlist_id: wishlistId }).expect(401)

        await expectTable(Fixtures.WISHLIST_MESSAGE_READ_TABLE).hasNumberOfRows(0)
      })

      it('should silently succeed when user is owner with hideItems=true', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
          hideItems: true,
        })

        await request.put(path).send({ wishlist_id: wishlistId }).expect(200)

        // No read record should be inserted since owner can't see messages
        await expectTable(Fixtures.WISHLIST_MESSAGE_READ_TABLE).hasNumberOfRows(0)
      })
    })
  })

  describe('DELETE /wishlist-message/:id', () => {
    const path = (id: string) => `/wishlist-message/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      await unauthenticatedRequest.delete(path(uuid())).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should delete a message when user is the author', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: ownerId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: ownerId,
          title: 'Test Wishlist',
        })

        const messageId = await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: currentUserId,
          content: 'To be deleted',
        })

        await request.delete(path(messageId)).expect(200)

        await expectTable(Fixtures.WISHLIST_MESSAGE_TABLE).hasNumberOfRows(0)
      })

      it('should return 401 when user is not the author', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Owner',
          lastname: 'User',
        })

        const otherUserId = await fixtures.insertUser({
          email: 'other@test.fr',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: ownerId,
        })
        await fixtures.insertActiveAttendee({ eventId, userId: currentUserId })
        await fixtures.insertActiveAttendee({ eventId, userId: otherUserId })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: ownerId,
          title: 'Test Wishlist',
        })

        const messageId = await fixtures.insertWishlistMessage({
          wishlistId,
          authorId: otherUserId,
          content: 'Not my message',
        })

        await request.delete(path(messageId)).expect(401)

        await expectTable(Fixtures.WISHLIST_MESSAGE_TABLE).hasNumberOfRows(1)
      })

      it('should return 404 when message does not exist', async () => {
        await request.delete(path(uuid())).expect(404)
      })
    })
  })
})
