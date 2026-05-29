import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'

const GRAPHQL_PATH = '/graphql'

/**
 * Integration tests for the GraphQL WishlistAdminResolver (@IsAdmin).
 *
 * GraphQL always returns HTTP 200; thrown Nest exceptions are mapped to typed
 * rejections placed at data.<field>. A non-admin authenticated user is rejected
 * with a ForbiddenRejection.
 */
describe('WishlistAdminResolver (GraphQL)', () => {
  const { getRequest, getFixtures } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

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
    `

    it('should not succeed when unauthenticated', async () => {
      const request = await getRequest()
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { filters: { userId: uuid() } } })
        .expect(200)

      expect(res.body.data?.adminWishlists?.__typename).not.toBe('AdminGetWishlists')
    })

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query, variables: { filters: { userId: uuid() } } })
        .expect(200)

      expect(res.body.data.adminWishlists).toMatchObject({ __typename: 'ForbiddenRejection' })
    })

    describe('when user is authenticated as ADMIN_USER', () => {
      let request: RequestApp

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it("should return a paginated list of a given user's wishlists", async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: targetUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: targetUserId,
          title: 'Target Wishlist',
        })

        // A wishlist owned by another user, which must NOT be returned
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.fr',
          firstname: 'Other',
          lastname: 'User',
        })
        const { eventId: otherEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })
        await fixtures.insertWishlist({
          eventIds: [otherEventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId, page: 1, limit: 50 } } })
          .expect(200)

        expect(res.body.data.adminWishlists.__typename).toBe('AdminGetWishlists')
        expect(res.body.data.adminWishlists.data).toEqual([
          expect.objectContaining({ id: wishlistId, title: 'Target Wishlist', ownerId: targetUserId }),
        ])
        expect(res.body.data.adminWishlists.pagination).toMatchObject({
          totalElements: 1,
          pageNumber: 1,
          pageSize: 50,
        })
      })

      it('should respect pagination (limit / page)', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Target Event',
          maintainerId: targetUserId,
        })

        await fixtures.insertWishlist({ eventIds: [eventId], userId: targetUserId, title: 'WL 1' })
        await fixtures.insertWishlist({ eventIds: [eventId], userId: targetUserId, title: 'WL 2' })
        await fixtures.insertWishlist({ eventIds: [eventId], userId: targetUserId, title: 'WL 3' })

        const firstPage = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId, page: 1, limit: 2 } } })
          .expect(200)

        expect(firstPage.body.data.adminWishlists.data).toHaveLength(2)
        expect(firstPage.body.data.adminWishlists.pagination).toMatchObject({
          totalElements: 3,
          totalPages: 2,
          pageNumber: 1,
          pageSize: 2,
        })

        const secondPage = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId, page: 2, limit: 2 } } })
          .expect(200)

        expect(secondPage.body.data.adminWishlists.data).toHaveLength(1)
        expect(secondPage.body.data.adminWishlists.pagination).toMatchObject({
          totalElements: 3,
          pageNumber: 2,
          pageSize: 2,
        })
      })

      it('should return an empty list when the user has no wishlist', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { filters: { userId: targetUserId } } })
          .expect(200)

        expect(res.body.data.adminWishlists.__typename).toBe('AdminGetWishlists')
        expect(res.body.data.adminWishlists.data).toEqual([])
        expect(res.body.data.adminWishlists.pagination).toMatchObject({ totalElements: 0 })
      })

      it.each([
        { filters: { userId: uuid(), page: 0 }, case: 'page below minimum' },
        { filters: { userId: uuid(), limit: 0 }, case: 'limit below minimum' },
      ])('should return ValidationRejection when $case', async ({ filters }) => {
        const res = await request.post(GRAPHQL_PATH).send({ query, variables: { filters } }).expect(200)

        expect(res.body.data.adminWishlists).toMatchObject({ __typename: 'ValidationRejection' })
      })
    })
  })
})
