import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { uuid } from '@wishlist/common';
import { DateTime } from 'luxon';

import { AttendeeRole } from '../../event/domain/attendee-role.enum';

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
  const { getRequest, getFixtures, expectTable } = useTestApp();
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = getFixtures();
  });

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
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post('/graphql')
        .send({ query, variables: { wishlistId: uuid() } })
        .expect(200);

      expect(res.body.data?.importableItems?.__typename).not.toBe('GetImportableItemsOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should return importable items from old wishlists', async () => {
        const { eventId: targetEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: currentUserId,
        });

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [targetEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        });

        const oldEventDate = DateTime.now().minus({ months: 3 }).toJSDate();
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        });

        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        });

        const importableItemId = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Importable Item',
          description: 'Should be importable',
        });

        // Taken item -> not importable
        await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Taken Item',
          takerId: currentUserId,
          takenAt: new Date(),
        });

        const res = await request
          .post('/graphql')
          .send({ query, variables: { wishlistId: targetWishlistId } })
          .expect(200);

        expect(res.body.data.importableItems).toMatchObject({
          __typename: 'GetImportableItemsOutput',
          items: [
            {
              id: importableItemId,
              name: 'Importable Item',
              description: 'Should be importable',
            },
          ],
        });
      });

      it('should return empty items when there is nothing to import', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: currentUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        });

        const res = await request.post('/graphql').send({ query, variables: { wishlistId } }).expect(200);

        expect(res.body.data.importableItems).toEqual({
          __typename: 'GetImportableItemsOutput',
          items: [],
        });
      });

      it('should not succeed when target wishlist does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query, variables: { wishlistId: uuid() } })
          .expect(200);

        expect(res.body.data.importableItems.__typename).not.toBe('GetImportableItemsOutput');
      });

      it('should return UnauthorizedRejection when user is not the owner of the wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        });

        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const res = await request
          .post('/graphql')
          .send({ query, variables: { wishlistId: otherWishlistId } })
          .expect(200);

        expect(res.body.data.importableItems.__typename).toBe('UnauthorizedRejection');
      });
    });
  });

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
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { input: { wishlistId: uuid(), name: 'Item' } } })
        .expect(200);

      expect(res.body.data?.createItem?.__typename).not.toBe('Item');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should create item successfully on own wishlist (not suggested)', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        });

        const input = {
          wishlistId,
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          pictureUrl: 'https://example.com/pic.jpg',
        };

        const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

        expect(res.body.data.createItem).toMatchObject({
          __typename: 'Item',
          id: expect.toBeString(),
          name: 'Test Item',
          description: 'Test description',
          url: 'https://example.com',
          score: 5,
          pictureUrl: 'https://example.com/pic.jpg',
          isSuggested: false,
        });

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
        });
      });

      it('should create a suggested item when user is not the wishlist owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.PARTICIPANT,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId, name: 'Suggested Item' } } })
          .expect(200);

        expect(res.body.data.createItem).toMatchObject({
          __typename: 'Item',
          name: 'Suggested Item',
          isSuggested: true,
        });

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: res.body.data.createItem.id,
          name: 'Suggested Item',
          is_suggested: true,
          wishlist_id: wishlistId,
        });
      });

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
          .expect(200);

        expect(res.body.data.createItem.__typename).toBe('ValidationRejection');
        expect(res.body.data.createItem.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field })]));

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
      });

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId: uuid(), name: 'Test Item' } } })
          .expect(200);

        expect(res.body.data.createItem.__typename).toBe('NotFoundRejection');

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
      });

      it('should return UnauthorizedRejection when user has no access to wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId, name: 'Test Item' } } })
          .expect(200);

        expect(res.body.data.createItem.__typename).toBe('UnauthorizedRejection');

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
      });
    });
  });

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
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { itemId: uuid(), input: { name: 'Updated' } } })
        .expect(200);

      expect(res.body.data?.updateItem?.__typename).not.toBe('VoidOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should update item successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        });

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Original Item',
          description: 'Original description',
        });

        const input = {
          name: 'Updated Item',
          description: 'Updated description',
          url: 'https://updated.com',
          score: 4,
          pictureUrl: 'https://updated.com/pic.jpg',
        };

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId, input } }).expect(200);

        expect(res.body.data.updateItem).toEqual({
          __typename: 'VoidOutput',
          success: true,
        });

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Updated Item',
          description: 'Updated description',
          url: 'https://updated.com',
          score: 4,
          picture_url: 'https://updated.com/pic.jpg',
          updated_at: expect.toBeDate(),
        });
      });

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
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        });

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Original Item' });

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId, input } }).expect(200);

        expect(res.body.data.updateItem.__typename).toBe('ValidationRejection');
        expect(res.body.data.updateItem.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field })]));

        // Verify item is unchanged
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Original Item',
        });
      });

      it('should return NotFoundRejection when item does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId: uuid(), input: { name: 'Updated Item' } } })
          .expect(200);

        expect(res.body.data.updateItem.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when user has no access to the item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' });

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId, input: { name: 'Updated Item' } } })
          .expect(200);

        expect(res.body.data.updateItem.__typename).toBe('UnauthorizedRejection');

        // Verify no changes were made
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
          name: 'Test Item',
        });
      });
    });
  });

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
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { itemId: uuid() } })
        .expect(200);

      expect(res.body.data?.deleteItem?.__typename).not.toBe('VoidOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should delete item successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'My Wishlist',
        });

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' });

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200);

        expect(res.body.data.deleteItem).toEqual({
          __typename: 'VoidOutput',
          success: true,
        });

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
      });

      it('should return NotFoundRejection when item does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId: uuid() } })
          .expect(200);

        expect(res.body.data.deleteItem.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when user has no access to the item and not delete it', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' });

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200);

        expect(res.body.data.deleteItem.__typename).toBe('UnauthorizedRejection');

        // Verify the item still exists
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1);
      });
    });
  });

  describe('Mutation toggleItem', () => {
    const mutation = /* GraphQL */ `
      mutation ToggleItem($itemId: ItemId!) {
        toggleItem(itemId: $itemId) {
          __typename
          ... on ToggleItemOutput {
            takers {
              userId
              takenAt
              user {
                id
                firstName
              }
            }
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { itemId: uuid() } })
        .expect(200);

      expect(res.body.data?.toggleItem?.__typename).not.toBe('ToggleItemOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should check (take) an item that is not yet taken', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.PARTICIPANT,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item', isSuggested: false });

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200);

        expect(res.body.data.toggleItem).toMatchObject({
          __typename: 'ToggleItemOutput',
          takers: [
            {
              userId: currentUserId,
              takenAt: expect.toBeString(),
              user: {
                id: currentUserId,
                firstName: 'John',
              },
            },
          ],
        });

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
        });

        await expectTable(Fixtures.ITEM_TAKER_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          item_id: itemId,
          user_id: currentUserId,
          taken_at: expect.toBeDate(),
        });
      });

      it('should uncheck (release) an item already taken by the current user (flip state)', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.PARTICIPANT,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
          isSuggested: false,
          takerId: currentUserId,
          takenAt: new Date(),
        });

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200);

        expect(res.body.data.toggleItem).toEqual({
          __typename: 'ToggleItemOutput',
          takers: [],
        });

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
        });

        await expectTable(Fixtures.ITEM_TAKER_TABLE).hasNumberOfRows(0);
      });

      it('should join an item already taken by someone else', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        await fixtures.insertActiveAttendee({
          eventId,
          userId: currentUserId,
          role: AttendeeRole.PARTICIPANT,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Test Item',
          isSuggested: false,
          takerId: otherUserId,
          takenAt: new Date(),
        });

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200);

        expect(res.body.data.toggleItem.__typename).toBe('ToggleItemOutput');
        expect(res.body.data.toggleItem.takers).toHaveLength(2);
        expect(res.body.data.toggleItem.takers.map((taker: { userId: string }) => taker.userId).sort()).toEqual(
          [currentUserId, otherUserId].sort(),
        );

        await expectTable(Fixtures.ITEM_TAKER_TABLE).hasNumberOfRows(2);
      });

      it('should return NotFoundRejection when item does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { itemId: uuid() } })
          .expect(200);

        expect(res.body.data.toggleItem.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when user has no access to the item', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const itemId = await fixtures.insertItem({ wishlistId, name: 'Test Item' });

        const res = await request.post('/graphql').send({ query: mutation, variables: { itemId } }).expect(200);

        expect(res.body.data.toggleItem.__typename).toBe('UnauthorizedRejection');

        // Item should remain untaken
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: itemId,
        });

        await expectTable(Fixtures.ITEM_TAKER_TABLE).hasNumberOfRows(0);
      });
    });
  });

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
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { input: { wishlistId: uuid(), sourceItemIds: [uuid()] } } })
        .expect(200);

      expect(res.body.data?.importItems?.__typename).not.toBe('ImportItemsOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should import items from an old wishlist of the current user', async () => {
        const oldEventDate = DateTime.now().minus({ months: 3 }).toJSDate();
        const { eventId: oldEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Old Event',
          maintainerId: currentUserId,
          eventDate: oldEventDate,
        });

        const oldWishlistId = await fixtures.insertWishlist({
          eventIds: [oldEventId],
          userId: currentUserId,
          title: 'Old Wishlist',
        });

        const item1Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 1',
          description: 'Description 1',
          url: 'https://example1.com',
          score: 3,
        });

        const item2Id = await fixtures.insertItem({
          wishlistId: oldWishlistId,
          name: 'Item 2',
          description: 'Description 2',
          url: 'https://example2.com',
          score: 5,
        });

        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          maintainerId: currentUserId,
        });

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'Target Wishlist',
        });

        const res = await request
          .post('/graphql')
          .send({
            query: mutation,
            variables: { input: { wishlistId: targetWishlistId, sourceItemIds: [item1Id, item2Id] } },
          })
          .expect(200);

        expect(res.body.data.importItems.__typename).toBe('ImportItemsOutput');
        expect(res.body.data.importItems.items).toHaveLength(2);
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
        ]);

        // 2 original + 2 imported
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(4);
      });

      it.each([
        {
          case: 'empty source item ids',
          input: { wishlistId: uuid(), sourceItemIds: [] },
          field: 'sourceItemIds',
        },
      ])('should return ValidationRejection when invalid input: $case', async ({ input, field }) => {
        const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

        expect(res.body.data.importItems.__typename).toBe('ValidationRejection');
        expect(res.body.data.importItems.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field })]));

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
      });

      it('should return NotFoundRejection when target wishlist does not exist', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId: uuid(), sourceItemIds: [uuid()] } } })
          .expect(200);

        expect(res.body.data.importItems.__typename).toBe('NotFoundRejection');
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
      });

      it('should return UnauthorizedRejection when target wishlist belongs to another user', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: otherUserId,
        });

        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { wishlistId: otherWishlistId, sourceItemIds: [uuid()] } } })
          .expect(200);

        expect(res.body.data.importItems.__typename).toBe('UnauthorizedRejection');

        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
      });

      it('should return UnauthorizedRejection when importing items from another user wishlist', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const oldEventDate = DateTime.now().minus({ months: 3 }).toJSDate();
        const { eventId: otherEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Old Event',
          maintainerId: otherUserId,
          eventDate: oldEventDate,
        });

        const otherWishlistId = await fixtures.insertWishlist({
          eventIds: [otherEventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const otherItemId = await fixtures.insertItem({ wishlistId: otherWishlistId, name: 'Other User Item' });

        const { eventId: newEventId } = await fixtures.insertEventWithMaintainer({
          title: 'New Event',
          maintainerId: currentUserId,
        });

        const targetWishlistId = await fixtures.insertWishlist({
          eventIds: [newEventId],
          userId: currentUserId,
          title: 'My Wishlist',
        });

        const res = await request
          .post('/graphql')
          .send({
            query: mutation,
            variables: { input: { wishlistId: targetWishlistId, sourceItemIds: [otherItemId] } },
          })
          .expect(200);

        expect(res.body.data.importItems.__typename).toBe('UnauthorizedRejection');

        // Only the original item should exist
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1);
      });
    });
  });

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
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { input: { url: 'https://example.com' } } })
        .expect(200);

      expect(res.body.data?.scanItemUrl?.__typename).not.toBe('ScanItemUrlOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
      });

      it('should return ValidationRejection when the url is invalid', async () => {
        const res = await request
          .post('/graphql')
          .send({ query: mutation, variables: { input: { url: 'not-a-valid-url' } } })
          .expect(200);

        expect(res.body.data.scanItemUrl.__typename).toBe('ValidationRejection');
        expect(res.body.data.scanItemUrl.errors).toEqual(
          expect.arrayContaining([expect.objectContaining({ field: 'url' })]),
        );
      });

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
          .expect(200);

        expect(res.body.data.scanItemUrl).toEqual({
          __typename: 'ScanItemUrlOutput',
          pictureUrl: null,
        });
      });
    });
  });

  describe('Field resolver ItemTaker.user', () => {
    const createMutation = /* GraphQL */ `
      mutation CreateItem($input: CreateItemInput!) {
        createItem(input: $input) {
          __typename
          ... on Item {
            id
            takers {
              userId
              user {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      }
    `;

    const toggleMutation = /* GraphQL */ `
      mutation ToggleItem($itemId: ItemId!) {
        toggleItem(itemId: $itemId) {
          __typename
          ... on ToggleItemOutput {
            takers {
              userId
              user {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      }
    `;

    let request: RequestApp;
    let currentUserId: string;

    beforeEach(async () => {
      request = await getRequest({ signedAs: 'BASE_USER' });
      currentUserId = await fixtures.getSignedUserId('BASE_USER');
    });

    it('should return empty takers for a freshly created (untaken) item', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        maintainerId: currentUserId,
      });

      const wishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: currentUserId,
        title: 'My Wishlist',
      });

      const res = await request
        .post('/graphql')
        .send({ query: createMutation, variables: { input: { wishlistId, name: 'Fresh Item' } } })
        .expect(200);

      expect(res.body.data.createItem).toMatchObject({
        __typename: 'Item',
        takers: [],
      });
    });

    it('should resolve taker users after joining a reservation', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.com',
        firstname: 'Other',
        lastname: 'User',
      });

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        maintainerId: otherUserId,
      });

      await fixtures.insertActiveAttendee({
        eventId,
        userId: currentUserId,
        role: AttendeeRole.PARTICIPANT,
      });

      const wishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: otherUserId,
        title: 'Other Wishlist',
      });

      const itemId = await fixtures.insertItem({ wishlistId, name: 'Shared Gift', isSuggested: false });

      const res = await request.post('/graphql').send({ query: toggleMutation, variables: { itemId } }).expect(200);

      expect(res.body.data.toggleItem).toMatchObject({
        __typename: 'ToggleItemOutput',
        takers: [
          {
            userId: currentUserId,
            user: {
              id: currentUserId,
              firstName: 'John',
              lastName: 'Doe',
              email: 'test@test.fr',
            },
          },
        ],
      });
    });
  });

  describe('Query myReservedItems', () => {
    const query = /* GraphQL */ `
      query GetMyReservedItems($filters: MyReservedItemsFilters!) {
        myReservedItems(filters: $filters) {
          __typename
          ... on GetReservedItemsPagedResponse {
            data {
              id
              name
              description
              url
              score
              pictureUrl
              takenAt
              wishlistId
              wishlistTitle
              ownerFirstName
              ownerLastName
              events {
                id
                title
                eventDate
              }
              takers {
                userId
                firstName
                lastName
                pictureUrl
                takenAt
              }
            }
            pagination {
              totalPages
              totalElements
              pageNumber
              pageSize
            }
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200);

      expect(res.body.data?.myReservedItems?.__typename).not.toBe('GetReservedItemsPagedResponse');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should return an empty page when the user reserved nothing', async () => {
        const res = await request
          .post('/graphql')
          .send({ query, variables: { filters: {} } })
          .expect(200);

        expect(res.body.data.myReservedItems).toMatchObject({
          __typename: 'GetReservedItemsPagedResponse',
          data: [],
          pagination: { totalElements: 0, totalPages: 0, pageNumber: 1 },
        });
      });

      it('should return gifts reserved on someone else wishlist and ignore own lists and other takers', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'owner@test.fr',
          firstname: 'Ada',
          lastname: 'Lovelace',
        });
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Noël',
          eventDate: new Date('2026-12-25T12:00:00.000Z'),
          maintainerId: ownerId,
        });
        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: ownerId,
          title: 'Liste d Ada',
        });
        const takenAt = new Date('2026-09-01T10:00:00.000Z');
        const itemId = await fixtures.insertItem({
          wishlistId,
          name: 'Un livre',
          description: 'Edition illustrée',
          url: 'https://example.com/book',
          pictureUrl: 'https://example.com/book.jpg',
          takerId: currentUserId,
          takenAt,
        });

        const ownWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Ma liste',
        });
        await fixtures.insertItem({
          wishlistId: ownWishlistId,
          name: 'Mon cadeau',
          takerId: currentUserId,
        });

        const otherUserId = await fixtures.insertUser({
          email: 'other-taker@test.fr',
          firstname: 'Other',
          lastname: 'Taker',
        });
        const coTakerTakenAt = new Date('2026-09-02T11:00:00.000Z');
        await fixtures.insertItemTaker({ itemId, userId: otherUserId, takenAt: coTakerTakenAt });
        await fixtures.insertItem({
          wishlistId,
          name: 'Réservé par un autre',
          takerId: otherUserId,
        });

        const res = await request
          .post('/graphql')
          .send({ query, variables: { filters: {} } })
          .expect(200);

        expect(res.body.data.myReservedItems).toMatchObject({
          __typename: 'GetReservedItemsPagedResponse',
          data: [
            {
              id: itemId,
              name: 'Un livre',
              description: 'Edition illustrée',
              url: 'https://example.com/book',
              pictureUrl: 'https://example.com/book.jpg',
              takenAt: takenAt.toISOString(),
              wishlistId,
              wishlistTitle: 'Liste d Ada',
              ownerFirstName: 'Ada',
              ownerLastName: 'Lovelace',
              events: [{ id: eventId, title: 'Noël', eventDate: '2026-12-25' }],
              takers: [
                {
                  userId: currentUserId,
                  firstName: 'John',
                  lastName: 'Doe',
                  takenAt: takenAt.toISOString(),
                },
                {
                  userId: otherUserId,
                  firstName: 'Other',
                  lastName: 'Taker',
                  takenAt: coTakerTakenAt.toISOString(),
                },
              ],
            },
          ],
          pagination: { totalElements: 1, totalPages: 1, pageNumber: 1 },
        });
      });

      it('should paginate reserved gifts by soonest event date', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'pages@test.fr',
          firstname: 'Page',
          lastname: 'Owner',
        });
        const noonOn = (date: DateTime) => new Date(`${date.toFormat('yyyy-MM-dd')}T12:00:00.000Z`);
        const daysFromNow = [30, 5, 15];
        const ids: string[] = [];

        for (const days of daysFromNow) {
          const { eventId } = await fixtures.insertEventWithMaintainer({
            title: `Dans ${days} jours`,
            eventDate: noonOn(DateTime.now().plus({ days })),
            maintainerId: ownerId,
          });
          const wishlistId = await fixtures.insertWishlist({
            eventIds: [eventId],
            userId: ownerId,
            title: `Liste ${days}`,
          });
          ids.push(
            await fixtures.insertItem({
              wishlistId,
              name: `Cadeau ${days}`,
              takerId: currentUserId,
              takenAt: new Date(Date.now() - (30 - days) * 86_400_000),
            }),
          );
        }

        const firstPage = await request
          .post('/graphql')
          .send({ query, variables: { filters: { page: 1, limit: 2 } } })
          .expect(200);

        expect(firstPage.body.data.myReservedItems).toMatchObject({
          __typename: 'GetReservedItemsPagedResponse',
          pagination: { totalElements: 3, totalPages: 2, pageNumber: 1, pageSize: 2 },
        });
        expect(firstPage.body.data.myReservedItems.data.map((item: { id: string }) => item.id)).toEqual([
          ids[1],
          ids[2],
        ]);

        const secondPage = await request
          .post('/graphql')
          .send({ query, variables: { filters: { page: 2, limit: 2 } } })
          .expect(200);

        expect(secondPage.body.data.myReservedItems.data.map((item: { id: string }) => item.id)).toEqual([ids[0]]);
      });

      it('should split reserved gifts between upcoming and past events', async () => {
        const ownerId = await fixtures.insertUser({
          email: 'period@test.fr',
          firstname: 'Period',
          lastname: 'Owner',
        });
        const noonOn = (date: DateTime) => new Date(`${date.toFormat('yyyy-MM-dd')}T12:00:00.000Z`);
        const { eventId: futureEventId } = await fixtures.insertEventWithMaintainer({
          title: 'À venir',
          eventDate: noonOn(DateTime.now().plus({ days: 10 })),
          maintainerId: ownerId,
        });
        const { eventId: pastEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Passé',
          eventDate: noonOn(DateTime.now().minus({ days: 10 })),
          maintainerId: ownerId,
        });
        const futureWishlistId = await fixtures.insertWishlist({
          eventIds: [futureEventId],
          userId: ownerId,
          title: 'Liste à venir',
        });
        const pastWishlistId = await fixtures.insertWishlist({
          eventIds: [pastEventId],
          userId: ownerId,
          title: 'Liste passée',
        });
        const unlinkedWishlistId = await fixtures.insertWishlist({
          eventIds: [],
          userId: ownerId,
          title: 'Sans évènement',
        });
        const futureItemId = await fixtures.insertItem({
          wishlistId: futureWishlistId,
          name: 'Cadeau à venir',
          takerId: currentUserId,
        });
        const pastItemId = await fixtures.insertItem({
          wishlistId: pastWishlistId,
          name: 'Cadeau passé',
          takerId: currentUserId,
        });
        const unlinkedItemId = await fixtures.insertItem({
          wishlistId: unlinkedWishlistId,
          name: 'Cadeau sans date',
          takerId: currentUserId,
        });

        const reserved = await request
          .post('/graphql')
          .send({ query, variables: { filters: { period: 'RESERVED' } } })
          .expect(200);
        const past = await request
          .post('/graphql')
          .send({ query, variables: { filters: { period: 'PAST' } } })
          .expect(200);
        const all = await request
          .post('/graphql')
          .send({ query, variables: { filters: { period: 'ALL' } } })
          .expect(200);

        const idsOf = (res: typeof reserved) =>
          res.body.data.myReservedItems.data.map((item: { id: string }) => item.id).toSorted();

        expect(idsOf(reserved)).toEqual([futureItemId, unlinkedItemId].toSorted());
        expect(idsOf(past)).toEqual([pastItemId]);
        expect(idsOf(all)).toEqual([futureItemId, pastItemId, unlinkedItemId].toSorted());
      });
    });
  });
});
