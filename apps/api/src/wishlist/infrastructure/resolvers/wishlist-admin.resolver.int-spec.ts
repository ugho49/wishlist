import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { uuid } from '@wishlist/common';

import { WishlistMode } from '../../domain/wishlist-mode.enum';

const GRAPHQL_PATH = '/graphql';

/**
 * Integration tests for the GraphQL WishlistAdminResolver (@IsAdmin).
 *
 * GraphQL always returns HTTP 200; thrown exceptions are mapped to typed
 * rejections placed at data.<field>. A non-admin authenticated user is rejected
 * with a ForbiddenRejection.
 */
describe('WishlistAdminResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp();
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe('Query adminWishlists', () => {
    const query = /* GraphQL */ `
      query AdminWishlists($filters: AdminWishlistPaginationFilters!) {
        adminWishlists(filters: $filters) {
          __typename
          ... on AdminGetWishlists {
            data {
              id
              title
              ownerId
            }
            pagination {
              totalPages
              totalElements
              pageNumber
              pageSize
            }
          }
          ... on ForbiddenRejection {
            message
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

    it('should not succeed when unauthenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { filters: { userId: uuid() } } })
        .expect(200);

      expect(res.body.data?.adminWishlists?.__typename).not.toBe('AdminGetWishlists');
    });

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' });
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { filters: { userId: uuid() } } })
        .expect(200);

      expect(res.body.data.adminWishlists).toMatchObject({ __typename: 'ForbiddenRejection' });
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      let request: RequestApp;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
      });

      it("should return a paginated list of a given user's wishlists", async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: targetUserId,
        });

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: targetUserId,
          title: 'Target Wishlist',
        });

        // A wishlist owned by another user, which must NOT be returned
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.fr',
          firstname: 'Other',
          lastname: 'User',
        });
        const { eventId: otherEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        });
        await fixtures.insertWishlist({
          eventIds: [otherEventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId, page: 1, limit: 50 } } })
          .expect(200);

        expect(res.body.data.adminWishlists.__typename).toBe('AdminGetWishlists');
        expect(res.body.data.adminWishlists.data).toEqual([
          expect.objectContaining({ id: wishlistId, title: 'Target Wishlist', ownerId: targetUserId }),
        ]);
        expect(res.body.data.adminWishlists.pagination).toMatchObject({
          totalElements: 1,
          pageNumber: 1,
          pageSize: 50,
        });
      });

      it('should respect pagination (limit / page)', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: targetUserId,
        });

        await fixtures.insertWishlist({ eventIds: [eventId], userId: targetUserId, title: 'WL 1' });
        await fixtures.insertWishlist({ eventIds: [eventId], userId: targetUserId, title: 'WL 2' });
        await fixtures.insertWishlist({ eventIds: [eventId], userId: targetUserId, title: 'WL 3' });

        const firstPage = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId, page: 1, limit: 2 } } })
          .expect(200);

        expect(firstPage.body.data.adminWishlists.data).toHaveLength(2);
        expect(firstPage.body.data.adminWishlists.pagination).toMatchObject({
          totalElements: 3,
          totalPages: 2,
          pageNumber: 1,
          pageSize: 2,
        });

        const secondPage = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId, page: 2, limit: 2 } } })
          .expect(200);

        expect(secondPage.body.data.adminWishlists.data).toHaveLength(1);
        expect(secondPage.body.data.adminWishlists.pagination).toMatchObject({
          totalElements: 3,
          pageNumber: 2,
          pageSize: 2,
        });
      });

      it('should return an empty list when the user has no wishlist', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId } } })
          .expect(200);

        expect(res.body.data.adminWishlists.__typename).toBe('AdminGetWishlists');
        expect(res.body.data.adminWishlists.data).toEqual([]);
        expect(res.body.data.adminWishlists.pagination).toMatchObject({ totalElements: 0 });
      });

      it.each([
        { filters: { userId: uuid(), page: 0 }, case: 'page below minimum' },
        { filters: { userId: uuid(), limit: 0 }, case: 'limit below minimum' },
      ])('should return ValidationRejection when $case', async ({ filters }) => {
        const res = await request.post(GRAPHQL_PATH).send({ query, variables: { filters } }).expect(200);

        expect(res.body.data.adminWishlists).toMatchObject({ __typename: 'ValidationRejection' });
      });
    });
  });

  const insertOwnerAndWishlist = async (params?: { mode?: WishlistMode; withCoOwner?: boolean; logoUrl?: string }) => {
    const ownerId = await fixtures.insertUser({ email: 'owner@test.fr', firstname: 'Owner', lastname: 'User' });
    const coOwnerId = params?.withCoOwner
      ? await fixtures.insertUser({ email: 'coowner@test.fr', firstname: 'Co', lastname: 'Owner' })
      : undefined;
    const { eventId } = await fixtures.insertEventWithMaintainer({ title: 'Owner Event', maintainerId: ownerId });
    const wishlistId = await fixtures.insertWishlist({
      eventIds: [eventId],
      userId: ownerId,
      title: 'Owner Wishlist',
      mode: params?.mode,
      coOwnerId,
      logoUrl: params?.logoUrl,
    });
    return { ownerId, coOwnerId, eventId, wishlistId };
  };

  describe('Query adminWishlist', () => {
    const query = /* GraphQL */ `
      query AdminWishlist($id: WishlistId!) {
        adminWishlist(id: $id) {
          __typename
          ... on Wishlist {
            id
            title
            mode
            owner {
              id
            }
            coOwner {
              id
            }
            events {
              id
              title
            }
            items {
              id
              name
              isSuggested
              takers {
                userId
              }
            }
          }
          ... on ForbiddenRejection {
            message
          }
          ... on NotFoundRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when unauthenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { id: uuid() } })
        .expect(200);

      expect(res.body.data?.adminWishlist?.__typename).not.toBe('Wishlist');
    });

    it('should reject a BASE_USER with ForbiddenRejection, even for their own wishlist', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' });
      const currentUserId = await fixtures.getSignedUserId('BASE_USER');
      const { eventId } = await fixtures.insertEventWithMaintainer({ title: 'Event', maintainerId: currentUserId });
      const wishlistId = await fixtures.insertWishlist({ eventIds: [eventId], userId: currentUserId, title: 'Mine' });

      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { id: wishlistId } })
        .expect(200);

      expect(res.body.data.adminWishlist.__typename).toBe('ForbiddenRejection');
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      let request: RequestApp;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
      });

      it('should return any wishlist with its owner, co-owner, events and every item', async () => {
        const { ownerId, coOwnerId, eventId, wishlistId } = await insertOwnerAndWishlist({
          mode: WishlistMode.SHARED,
          withCoOwner: true,
        });
        const takerId = await fixtures.insertUser({ email: 'taker@test.fr', firstname: 'Taker', lastname: 'User' });
        const ownItemId = await fixtures.insertItem({ wishlistId, name: 'Own item' });
        const suggestedItemId = await fixtures.insertItem({
          wishlistId,
          name: 'Suggested item',
          isSuggested: true,
          takerId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { id: wishlistId } })
          .expect(200);

        expect(res.body.data.adminWishlist).toMatchObject({
          __typename: 'Wishlist',
          id: wishlistId,
          title: 'Owner Wishlist',
          mode: 'SHARED',
          owner: { id: ownerId },
          coOwner: { id: coOwnerId },
          events: [{ id: eventId, title: 'Owner Event' }],
        });
        expect(res.body.data.adminWishlist.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: ownItemId, isSuggested: false, takers: [] }),
            expect.objectContaining({ id: suggestedItemId, isSuggested: true, takers: [{ userId: takerId }] }),
          ]),
        );
      });

      it('should show the suggested items and the reservations of a surprise list', async () => {
        const { wishlistId } = await insertOwnerAndWishlist({ mode: WishlistMode.SURPRISE });
        const takerId = await fixtures.insertUser({ email: 'taker@test.fr', firstname: 'Taker', lastname: 'User' });
        const suggestedItemId = await fixtures.insertItem({
          wishlistId,
          name: 'Suggested item',
          isSuggested: true,
          takerId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { id: wishlistId } })
          .expect(200);

        expect(res.body.data.adminWishlist.items).toEqual([
          expect.objectContaining({ id: suggestedItemId, isSuggested: true, takers: [{ userId: takerId }] }),
        ]);
      });

      it('should return NotFoundRejection when the wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { id: uuid() } })
          .expect(200);

        expect(res.body.data.adminWishlist.__typename).toBe('NotFoundRejection');
      });
    });
  });

  describe('Mutation adminUpdateWishlist', () => {
    const mutation = /* GraphQL */ `
      mutation AdminUpdateWishlist($id: WishlistId!, $input: UpdateWishlistInput!) {
        adminUpdateWishlist(id: $id, input: $input) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when unauthenticated', async () => {
      const { wishlistId } = await insertOwnerAndWishlist();
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId, input: { title: 'Hacked' } } })
        .expect(200);

      expect(res.body.data?.adminUpdateWishlist?.__typename).not.toBe('VoidOutput');
      await expectTable(Fixtures.WISHLIST_TABLE).row(0).toMatchObject({ id: wishlistId, title: 'Owner Wishlist' });
    });

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const { wishlistId } = await insertOwnerAndWishlist();
      const request = await getRequest({ signedAs: 'BASE_USER' });
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId, input: { title: 'Hacked' } } })
        .expect(200);

      expect(res.body.data.adminUpdateWishlist.__typename).toBe('ForbiddenRejection');
      await expectTable(Fixtures.WISHLIST_TABLE).row(0).toMatchObject({ id: wishlistId, title: 'Owner Wishlist' });
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      let request: RequestApp;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
      });

      it('should update any wishlist', async () => {
        const { wishlistId } = await insertOwnerAndWishlist();

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { id: wishlistId, input: { title: 'Admin title', description: 'Admin description' } },
          })
          .expect(200);

        expect(res.body.data.adminUpdateWishlist).toEqual({ __typename: 'VoidOutput', success: true });
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Admin title',
          description: 'Admin description',
        });
      });

      it.each([
        { input: { title: '' }, case: 'title is empty' },
        { input: { title: 'a'.repeat(101) }, case: 'title is too long' },
        { input: { title: 'Ok', description: 'a'.repeat(2001) }, case: 'description is too long' },
      ])('should return ValidationRejection when $case', async ({ input }) => {
        const { wishlistId } = await insertOwnerAndWishlist();

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, input } })
          .expect(200);

        expect(res.body.data.adminUpdateWishlist.__typename).toBe('ValidationRejection');
        await expectTable(Fixtures.WISHLIST_TABLE).row(0).toMatchObject({ id: wishlistId, title: 'Owner Wishlist' });
      });

      it('should return NotFoundRejection when the wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), input: { title: 'X' } } })
          .expect(200);

        expect(res.body.data.adminUpdateWishlist.__typename).toBe('NotFoundRejection');
      });
    });
  });

  describe('Mutation adminDeleteWishlist', () => {
    const mutation = /* GraphQL */ `
      mutation AdminDeleteWishlist($id: WishlistId!) {
        adminDeleteWishlist(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when unauthenticated', async () => {
      const { wishlistId } = await insertOwnerAndWishlist();
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId } })
        .expect(200);

      expect(res.body.data?.adminDeleteWishlist?.__typename).not.toBe('VoidOutput');
      await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1);
    });

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const { wishlistId } = await insertOwnerAndWishlist();
      const request = await getRequest({ signedAs: 'BASE_USER' });
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId } })
        .expect(200);

      expect(res.body.data.adminDeleteWishlist.__typename).toBe('ForbiddenRejection');
      await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1);
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      let request: RequestApp;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
      });

      it('should delete any wishlist with its items and event links', async () => {
        const { wishlistId } = await insertOwnerAndWishlist();
        await fixtures.insertItem({ wishlistId, name: 'Item' });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200);

        expect(res.body.data.adminDeleteWishlist).toEqual({ __typename: 'VoidOutput', success: true });
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0);
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(0);
        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(0);
        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1);
      });

      it('should return NotFoundRejection when the wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200);

        expect(res.body.data.adminDeleteWishlist.__typename).toBe('NotFoundRejection');
      });
    });
  });

  describe('Mutation adminRemoveWishlistLogo', () => {
    const mutation = /* GraphQL */ `
      mutation AdminRemoveWishlistLogo($id: WishlistId!) {
        adminRemoveWishlistLogo(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `;
    const logoUrl = 'https://storage.test/logo.webp';

    it('should not succeed when unauthenticated', async () => {
      const { wishlistId } = await insertOwnerAndWishlist({ logoUrl });
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId } })
        .expect(200);

      expect(res.body.data?.adminRemoveWishlistLogo?.__typename).not.toBe('VoidOutput');
      await expectTable(Fixtures.WISHLIST_TABLE).row(0).toMatchObject({ id: wishlistId, logo_url: logoUrl });
    });

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const { wishlistId } = await insertOwnerAndWishlist({ logoUrl });
      const request = await getRequest({ signedAs: 'BASE_USER' });
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId } })
        .expect(200);

      expect(res.body.data.adminRemoveWishlistLogo.__typename).toBe('ForbiddenRejection');
      await expectTable(Fixtures.WISHLIST_TABLE).row(0).toMatchObject({ id: wishlistId, logo_url: logoUrl });
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      let request: RequestApp;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
      });

      it('should remove the logo of any wishlist', async () => {
        const { wishlistId } = await insertOwnerAndWishlist({ logoUrl });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200);

        expect(res.body.data.adminRemoveWishlistLogo).toEqual({ __typename: 'VoidOutput', success: true });
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          logo_url: null,
        });
      });

      it('should return NotFoundRejection when the wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200);

        expect(res.body.data.adminRemoveWishlistLogo.__typename).toBe('NotFoundRejection');
      });
    });
  });

  describe('Mutation adminRemoveWishlistCoOwner', () => {
    const mutation = /* GraphQL */ `
      mutation AdminRemoveWishlistCoOwner($id: WishlistId!) {
        adminRemoveWishlistCoOwner(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when unauthenticated', async () => {
      const { wishlistId, coOwnerId } = await insertOwnerAndWishlist({ mode: WishlistMode.SHARED, withCoOwner: true });
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId } })
        .expect(200);

      expect(res.body.data?.adminRemoveWishlistCoOwner?.__typename).not.toBe('VoidOutput');
      await expectTable(Fixtures.WISHLIST_TABLE).row(0).toMatchObject({ id: wishlistId, co_owner_id: coOwnerId });
    });

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const { wishlistId, coOwnerId } = await insertOwnerAndWishlist({ mode: WishlistMode.SHARED, withCoOwner: true });
      const request = await getRequest({ signedAs: 'BASE_USER' });
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: wishlistId } })
        .expect(200);

      expect(res.body.data.adminRemoveWishlistCoOwner.__typename).toBe('ForbiddenRejection');
      await expectTable(Fixtures.WISHLIST_TABLE).row(0).toMatchObject({ id: wishlistId, co_owner_id: coOwnerId });
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      let request: RequestApp;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
      });

      it('should remove the co-owner of any wishlist', async () => {
        const { wishlistId } = await insertOwnerAndWishlist({ mode: WishlistMode.SHARED, withCoOwner: true });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200);

        expect(res.body.data.adminRemoveWishlistCoOwner).toEqual({ __typename: 'VoidOutput', success: true });
        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        });
      });

      it('should return NotFoundRejection when the wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200);

        expect(res.body.data.adminRemoveWishlistCoOwner.__typename).toBe('NotFoundRejection');
      });
    });
  });
});
