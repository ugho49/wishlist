import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { AttendeeRole, uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

/**
 * Integration tests for the GraphQL ItemResolver.
 *
 * Notes on GraphQL error handling in this codebase:
 * - GraphQL always returns HTTP 200, even for resolver-level rejections.
 * - The useErrorTransformPlugin converts thrown Nest exceptions into a typed
 *   rejection placed at data.<field>:
 *     - ZodValidationException  -> ValidationRejection
 *     - UnauthorizedException   -> UnauthorizedRejection
 *     - NotFoundException       -> NotFoundRejection
 *     - ForbiddenException      -> ForbiddenRejection
 *     - other HttpException     -> InternalErrorRejection
 * - Unauthenticated requests are blocked by the global AuthGuard which throws an
 *   UnauthorizedException; it surfaces as data.<field>.__typename being
 *   UnauthorizedRejection (i.e. the operation does NOT succeed).
 */
describe('ItemResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('Query importableItems', () => {
    const query = /* GraphQL */ `
      query GetImportableItems($wishlistId: WishlistId!) {
        importableItems(wishlistId: $wishlistId) {
          __typename
          ... on GetImportableItemsOutput {
            items {
              id
              name
              description
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
        .post('/graphql')
        .send({ query, variables: { wishlistId: uuid() } })
        .expect(200)

      expect(res.body.data?.importableItems?.__typename).not.toBe('GetImportableItemsOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should return importable items from old wishlists', async () => {
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        const oldEventDate = DateTime.now().minus({ months: 3 }).toJSDate()
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        const importableItemId = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Importable Item',
          description: 'Should be importable',
        })

        // Taken item -> not importable
        await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Taken Item',
          takerId: currentUserId,
          takenAt: new Date(),
        })

        const res = await request
          .post('/graphql')
          .send({ query, variables: { wishlistId: targetWishlistId } })
          .expect(200)

        expect(res.body.data.importableItems).toMatchObject({
          __typename: 'GetImportableItemsOutput',
          items: [
            {
              id: importableItemId,
              name: 'Importable Item',
              description: 'Should be importable',
            },
          ],
        })
      })

      it('should return empty items when there is nothing to import', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        const res = await request.post('/graphql').send({ query, variables: { wishlistId } }).expect(200)

        expect(res.body.data.importableItems).toEqual({
          __typename: 'GetImportableItemsOutput',
          items: [],
        })
      })

      it('should not succeed when target wishlist does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query, variables: { wishlistId: uuid() } })
          .expect(200)

        expect(res.body.data.importableItems.__typename).not.toBe('GetImportableItemsOutput')
      })

      it('should return UnauthorizedRejection when user is not the owner of the wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const res = await request
          .post('/graphql')
          .send({ query, variables: { wishlistId: otherWishlistId } })
          .expect(200)

        expect(res.body.data.importableItems.__typename).toBe('UnauthorizedRejection')
      })
    })
  })

  describe('Mutation createItem', () => {
    const mutation = /* GraphQL */ `
      mutation CreateItem($input: CreateItemInput!) {
        createItem(input: $input) {
          __typename
          ... on Item {
            id
            name
            description
            url
            score
            pictureUrl
            isSuggested
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
        .post('/graphql')
        .send({ query: mutation, variables: { input: { wishlistId: uuid(), name: 'Item' } } })
        .expect(200)

      expect(res.body.data?.createItem?.__typename).not.toBe('Item')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should create item successfully on own wishlist (not suggested)', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const input = {
          wishlistId,
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          pictureUrl: 'https://example.com/pic.jpg',
        }

        const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

        expect(res.body.data.createItem).toMatchObject({
          __typename: 'Item',
          id: expect.toBeString(),
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          pictureUrl: 'https://example.com/pic.jpg',
          isSuggested: false,
        })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: res.body.data.createItem.id,
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

      it('should create a suggested item when user is not the wishlist owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
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

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId, name: 'Suggested Item' } } })
          .expect(200)

        expect(res.body.data.createItem).toMatchObject({
          __typename: 'Item',
          name: 'Suggested Item',
          isSuggested: true,
        })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: res.body.data.createItem.id,
          name: 'Suggested Item',
          is_suggested: true,
          wishlist_id: wishlistId,
        })
      })

      it.each([
        {
          case: 'empty name',
          input: { name: '' },
          field: 'name',
        },
        {
          case: 'name too long',
          input: { name: 'a'.repeat(41) },
          field: 'name',
        },
        {
          case: 'invalid url',
          input: { name: 'Item Name', url: 'invalid-url' },
          field: 'url',
        },
        {
          case: 'score too high',
          input: { name: 'Item Name', score: 6 },
          field: 'score',
        },
        {
          case: 'score too low',
          input: { name: 'Item Name', score: -1 },
          field: 'score',
        },
        {
          case: 'invalid picture url',
          input: { name: 'Item Name', pictureUrl: 'not-a-url' },
          field: 'pictureUrl',
        },
      ])('should return ValidationRejection when invalid input: $case', async ({ input, field }) => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId: uuid(), ...input } } })
          .expect(200)

        expect(res.body.data.createItem.__typename).toBe('ValidationRejection')
        expect(res.body.data.createItem.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field })]))

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId: uuid(), name: 'Test Item' } } })
          .expect(200)

        expect(res.body.data.createItem.__typename).toBe('NotFoundRejection')

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return UnauthorizedRejection when user has no access to wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
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
          title: 'Other Wishlist',
        })

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId, name: 'Test Item' } } })
          .expect(200)

        expect(res.body.data.createItem.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })
    })
  })

  describe('Mutation updateItem', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateItem($itemId: ItemId!, $input: UpdateItemInput!) {
        updateItem(itemId: $itemId, input: $input) {
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
        .post('/graphql')
        .send({ query: mutation, variables: { itemId: uuid(), input: { name: 'Updated' } } })
        .expect(200)

      expect(res.body.data?.updateItem?.__typename).not.toBe('VoidOutput')
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
        })

        const input = {
          name: 'Updated Item',
          description: 'Updated description',
          url: 'https://updated.com',
          score: 4,
          pictureUrl: 'https://updated.com/pic.jpg',
        }

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId, input } }).expect(200)

        expect(res.body.data.updateItem).toEqual({
          __typename: 'VoidOutput',
          success: true,
        })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Updated Item',
          description: 'Updated description',
          url: 'https://updated.com',
          score: 4,
          picture_url: 'https://updated.com/pic.jpg',
          updated_at: expect.toBeDate(),
        })
      })

      it.each([
        {
          case: 'empty name',
          input: { name: '' },
          field: 'name',
        },
        {
          case: 'name too long',
          input: { name: 'a'.repeat(41) },
          field: 'name',
        },
        {
          case: 'invalid url',
          input: { name: 'Item Name', url: 'invalid-url' },
          field: 'url',
        },
        {
          case: 'score too high',
          input: { name: 'Item Name', score: 6 },
          field: 'score',
        },
      ])('should return ValidationRejection when invalid input: $case', async ({ input, field }) => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Original Item' })

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId, input } }).expect(200)

        expect(res.body.data.updateItem.__typename).toBe('ValidationRejection')
        expect(res.body.data.updateItem.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field })]))

        // Verify item is unchanged
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Original Item',
        })
      })

      it('should return NotFoundRejection when item does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId: uuid(), input: { name: 'Updated Item' } } })
          .expect(200)

        expect(res.body.data.updateItem.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user has no access to the item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
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
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' })

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId, input: { name: 'Updated Item' } } })
          .expect(200)

        expect(res.body.data.updateItem.__typename).toBe('UnauthorizedRejection')

        // Verify no changes were made
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Test Item',
        })
      })
    })
  })

  describe('Mutation deleteItem', () => {
    const mutation = /* GraphQL */ `
      mutation DeleteItem($itemId: ItemId!) {
        deleteItem(itemId: $itemId) {
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
        .post('/graphql')
        .send({ query: mutation, variables: { itemId: uuid() } })
        .expect(200)

      expect(res.body.data?.deleteItem?.__typename).not.toBe('VoidOutput')
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
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' })

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200)

        expect(res.body.data.deleteItem).toEqual({
          __typename: 'VoidOutput',
          success: true,
        })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return NotFoundRejection when item does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId: uuid() } })
          .expect(200)

        expect(res.body.data.deleteItem.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user has no access to the item and not delete it', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
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
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' })

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200)

        expect(res.body.data.deleteItem.__typename).toBe('UnauthorizedRejection')

        // Verify the item still exists
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })
    })
  })

  describe('Mutation toggleItem', () => {
    const mutation = /* GraphQL */ `
      mutation ToggleItem($itemId: ItemId!) {
        toggleItem(itemId: $itemId) {
          __typename
          ... on ToggleItemOutput {
            takenById
            takenAt
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
        .post('/graphql')
        .send({ query: mutation, variables: { itemId: uuid() } })
        .expect(200)

      expect(res.body.data?.toggleItem?.__typename).not.toBe('ToggleItemOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should check (take) an item that is not yet taken', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
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

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item', isSuggested: false })

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200)

        expect(res.body.data.toggleItem).toMatchObject({
          __typename: 'ToggleItemOutput',
          takenById: currentUserId,
          takenAt: expect.toBeString(),
        })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          taker_id: currentUserId,
          taken_at: expect.toBeDate(),
        })
      })

      it('should uncheck (release) an item already taken by the current user (flip state)', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
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

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200)

        expect(res.body.data.toggleItem).toEqual({
          __typename: 'ToggleItemOutput',
          takenById: null,
          takenAt: null,
        })

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          taker_id: null,
          taken_at: null,
        })
      })

      it('should return NotFoundRejection when item does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId: uuid() } })
          .expect(200)

        expect(res.body.data.toggleItem.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user has no access to the item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
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
          title: 'Other Wishlist',
        })

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' })

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200)

        expect(res.body.data.toggleItem.__typename).toBe('UnauthorizedRejection')

        // Item should remain untaken
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          taker_id: null,
          taken_at: null,
        })
      })
    })
  })

  describe('Mutation importItems', () => {
    const mutation = /* GraphQL */ `
      mutation ImportItems($input: ImportItemsInput!) {
        importItems(input: $input) {
          __typename
          ... on ImportItemsOutput {
            items {
              id
              name
              description
              url
              score
            }
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
        .post('/graphql')
        .send({ query: mutation, variables: { input: { wishlistId: uuid(), sourceItemIds: [uuid()] } } })
        .expect(200)

      expect(res.body.data?.importItems?.__typename).not.toBe('ImportItemsOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should import items from an old wishlist of the current user', async () => {
        const oldEventDate = DateTime.now().minus({ months: 3 }).toJSDate()
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        })

        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        })

        const item1Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 1',
          description: 'Description 1',
          url: 'https://example1.com',
          score: 3,
        })

        const item2Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 2',
          description: 'Description 2',
          url: 'https://example2.com',
          score: 5,
        })

        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        })

        const res = await request
          .post('/graphql')
          .send({
            query: mutation,
            variables: { input: { wishlistId: targetWishlistId, sourceItemIds: [item1Id, item2Id] } },
          })
          .expect(200)

        expect(res.body.data.importItems.__typename).toBe('ImportItemsOutput')
        expect(res.body.data.importItems.items).toHaveLength(2)
        expect(res.body.data.importItems.items).toEqual([
          expect.objectContaining({
            name: 'Item 1',
            description: 'Description 1',
            url: 'https://example1.com',
            score: 3,
          }),
          expect.objectContaining({
            name: 'Item 2',
            description: 'Description 2',
            url: 'https://example2.com',
            score: 5,
          }),
        ])

        // 2 original + 2 imported
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(4)
      })

      it.each([
        {
          case: 'empty source item ids',
          input: { wishlistId: uuid(), sourceItemIds: [] },
          field: 'sourceItemIds',
        },
      ])('should return ValidationRejection when invalid input: $case', async ({ input, field }) => {
        const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

        expect(res.body.data.importItems.__typename).toBe('ValidationRejection')
        expect(res.body.data.importItems.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field })]))

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return NotFoundRejection when target wishlist does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId: uuid(), sourceItemIds: [uuid()] } } })
          .expect(200)

        expect(res.body.data.importItems.__typename).toBe('NotFoundRejection')
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return UnauthorizedRejection when target wishlist belongs to another user', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        })

        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId: otherWishlistId, sourceItemIds: [uuid()] } } })
          .expect(200)

        expect(res.body.data.importItems.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0)
      })

      it('should return UnauthorizedRejection when importing items from another user wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const oldEventDate = DateTime.now().minus({ months: 3 }).toJSDate()
        const { eventId: otherEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Old Event',
          maintainerId: otherUserId,
          eventDate: oldEventDate,
        })

        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [otherEventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const otherItemId = await fixtures.insertItem({ wishlistId: otherWishlistId, name: 'Other User Item' })

        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          maintainerId: currentUserId,
        })

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const res = await request
          .post('/graphql')
          .send({
            query: mutation,
            variables: { input: { wishlistId: targetWishlistId, sourceItemIds: [otherItemId] } },
          })
          .expect(200)

        expect(res.body.data.importItems.__typename).toBe('UnauthorizedRejection')

        // Only the original item should exist
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
      })
    })
  })

  describe('Mutation scanItemUrl', () => {
    const mutation = /* GraphQL */ `
      mutation ScanItemUrl($input: ScanItemUrlInput!) {
        scanItemUrl(input: $input) {
          __typename
          ... on ScanItemUrlOutput {
            pictureUrl
          }
          ... on ValidationRejection {
            errors {
              field
              message
            }
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { input: { url: 'https://example.com' } } })
        .expect(200)

      expect(res.body.data?.scanItemUrl?.__typename).not.toBe('ScanItemUrlOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
      })

      it('should return ValidationRejection when the url is invalid', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { url: 'not-a-valid-url' } } })
          .expect(200)

        expect(res.body.data.scanItemUrl.__typename).toBe('ValidationRejection')
        expect(res.body.data.scanItemUrl.errors).toEqual(
          expect.arrayContaining([expect.objectContaining({ field: 'url' })]),
        )
      })

      // Note: the scanner performs an outbound HTTP fetch but swallows ALL errors
      // (returning null on failure), so for an unreachable host it resolves to a
      // ScanItemUrlOutput with a null pictureUrl without depending on the network.
      it('should return a ScanItemUrlOutput (null picture) for an unreachable host', async () => {
        const res = await request
          .post('/graphql')
          .send({
            query: mutation,
            variables: { input: { url: 'http://localhost:1/this-host-should-not-respond' } },
          })
          .expect(200)

        expect(res.body.data.scanItemUrl).toEqual({
          __typename: 'ScanItemUrlOutput',
          pictureUrl: null,
        })
      })
    })
  })

  describe('Field resolver Item.takerUser', () => {
    // The Item.takerUser field resolver returns undefined when the parent Item has no
    // takenById, otherwise it loads the user via the dataloader. Every Item-returning
    // operation in this resolver (createItem / importItems / importableItems) produces
    // an Item with no taker, so we assert the resolver returns null (no taker) for a fresh item.
    const createMutation = /* GraphQL */ `
      mutation CreateItem($input: CreateItemInput!) {
        createItem(input: $input) {
          __typename
          ... on Item {
            id
            takenById
            takerUser {
              id
              firstName
              lastName
              email
            }
          }
        }
      }
    `

    let request: RequestApp
    let currentUserId: string

    beforeEach(async () => {
      request = await getRequest({ signedAs: 'BASE_USER' })
      currentUserId = await fixtures.getSignedUserId('BASE_USER')
    })

    it('should return null takerUser for a freshly created (untaken) item', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        maintainerId: currentUserId,
      })

      const wishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: currentUserId,
        title: 'My Wishlist',
      })

      const res = await request
        .post('/graphql')
        .send({ query: createMutation, variables: { input: { wishlistId, name: 'Fresh Item' } } })
        .expect(200)

      expect(res.body.data.createItem).toMatchObject({
        __typename: 'Item',
        takenById: null,
        takerUser: null,
      })
    })
  })
})
