import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'

type GraphQLResponseBody = {
  data?: Record<string, unknown>
  errors?: { message: string; path?: string[] }[]
}

const REJECTION_TYPENAMES = [
  'UnauthorizedRejection',
  'ForbiddenRejection',
  'NotFoundRejection',
  'InternalErrorRejection',
  'ValidationRejection',
]

function expectNotSucceeded(body: GraphQLResponseBody, fieldName: string): void {
  const field = body.data?.[fieldName] as { __typename?: string } | null | undefined
  const succeeded =
    field != null && typeof field.__typename === 'string' && !REJECTION_TYPENAMES.includes(field.__typename)

  expect(succeeded).toBe(false)
}

describe('WishlistResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures
  let request: RequestApp
  let currentUserId: string

  beforeEach(async () => {
    fixtures = getFixtures()
    request = await getRequest({ signedAs: 'BASE_USER' })
    currentUserId = await fixtures.getSignedUserId('BASE_USER')
  })

  describe('Query wishlist', () => {
    const query = /* GraphQL */ `
      query GetWishlistById($id: WishlistId!) {
        wishlist(id: $id) {
          __typename
          ... on Wishlist {
            id
            title
            description
            ownerId
            coOwnerId
            eventIds
            config {
              hideItems
            }
            owner {
              id
              email
              firstName
              lastName
            }
            coOwner {
              id
              email
            }
            events {
              id
              title
            }
          }
          ... on NotFoundRejection {
            message
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticated = await getRequest()
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })
      const wishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: currentUserId,
        title: 'My wishlist',
      })

      const res = await unauthenticated
        .post('/graphql')
        .send({ query, variables: { id: wishlistId } })
        .expect(200)

      expectNotSucceeded(res.body, 'wishlist')
    })

    it('should return the wishlist with nested owner, coOwner and events on happy path', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Birthday',
        description: 'Birthday party',
        maintainerId: currentUserId,
      })

      const { userId: coOwnerId } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'co-owner@test.com',
        firstname: 'Co',
        lastname: 'Owner',
        eventId,
      })

      const wishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: currentUserId,
        title: 'My wishlist',
        description: 'My wishlist description',
        hideItems: false,
        coOwnerId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: wishlistId } })
        .expect(200)

      expect(res.body.errors).toBeUndefined()
      expect(res.body.data.wishlist).toMatchObject({
        __typename: 'Wishlist',
        id: wishlistId,
        title: 'My wishlist',
        description: 'My wishlist description',
        ownerId: currentUserId,
        coOwnerId,
        eventIds: [eventId],
        config: { hideItems: false },
        owner: {
          id: currentUserId,
          email: Fixtures.BASE_USER_EMAIL,
          firstName: 'John',
          lastName: 'Doe',
        },
        coOwner: {
          id: coOwnerId,
          email: 'co-owner@test.com',
        },
        events: [{ id: eventId, title: 'Birthday' }],
      })
    })

    it('should return coOwner as null when there is no coOwner', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Event without co-owner',
        maintainerId: currentUserId,
      })
      const wishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: currentUserId,
        title: 'Solo wishlist',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: wishlistId } })
        .expect(200)

      expect(res.body.data.wishlist).toMatchObject({
        __typename: 'Wishlist',
        id: wishlistId,
        coOwnerId: null,
        coOwner: null,
      })
    })

    it('should resolve events as empty when the current user has no access to the linked event', async () => {
      // wishlist is shared between two events, current user only has access to one of them
      const { eventId: accessibleEventId } = await fixtures.insertEventWithMaintainer({
        title: 'Accessible event',
        maintainerId: currentUserId,
      })

      const otherUserId = await fixtures.insertUser({
        email: 'other@test.com',
        firstname: 'Other',
        lastname: 'User',
      })
      const { eventId: hiddenEventId } = await fixtures.insertEventWithMaintainer({
        title: 'Hidden event',
        maintainerId: otherUserId,
      })

      const wishlistId = await fixtures.insertWishlist({
        eventIds: [accessibleEventId, hiddenEventId],
        userId: currentUserId,
        title: 'Multi-event wishlist',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: wishlistId } })
        .expect(200)

      const wishlist = res.body.data.wishlist
      expect(wishlist.__typename).toBe('Wishlist')
      expect(wishlist.eventIds).toEqual(expect.arrayContaining([accessibleEventId, hiddenEventId]))
      // events field-resolver filters out events the user cannot access
      expect(wishlist.events).toEqual([{ id: accessibleEventId, title: 'Accessible event' }])
    })

    it('should return NotFoundRejection when the wishlist does not exist', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data.wishlist).toMatchObject({
        __typename: 'NotFoundRejection',
      })
    })

    it('should return NotFoundRejection when the current user has no access to the wishlist (forbidden surfaced as not found)', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'stranger@test.com',
        firstname: 'Stranger',
        lastname: 'User',
      })
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Private event',
        maintainerId: otherUserId,
      })
      const wishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: otherUserId,
        title: 'Private wishlist',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: wishlistId } })
        .expect(200)

      expect(res.body.data.wishlist).toMatchObject({
        __typename: 'NotFoundRejection',
      })
    })
  })

  describe('Query wishlists', () => {
    const query = /* GraphQL */ `
      query GetMyWishlists($filters: PaginationFilters!) {
        wishlists(filters: $filters) {
          __typename
          ... on GetWishlistsPagedResponse {
            data {
              id
              title
              ownerId
              owner {
                id
                email
              }
              events {
                id
                title
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
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticated = await getRequest()

      const res = await unauthenticated
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expectNotSucceeded(res.body, 'wishlists')
    })

    it('should return only the wishlists owned by the current user with nested fields', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })

      const myWishlistId = await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: currentUserId,
        title: 'Mine',
      })

      // a wishlist owned by another user should NOT appear
      const otherUserId = await fixtures.insertUser({
        email: 'other2@test.com',
        firstname: 'Other',
        lastname: 'Two',
      })
      await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: otherUserId,
        title: 'Not mine',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expect(res.body.errors).toBeUndefined()
      const result = res.body.data.wishlists
      expect(result.__typename).toBe('GetWishlistsPagedResponse')
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toMatchObject({
        id: myWishlistId,
        title: 'Mine',
        ownerId: currentUserId,
        owner: { id: currentUserId, email: Fixtures.BASE_USER_EMAIL },
        events: [{ id: eventId, title: 'My event' }],
      })
      expect(result.pagination).toMatchObject({
        totalElements: 1,
        totalPages: 1,
        pageNumber: 1,
        pageSize: 10,
      })
    })

    it('should apply default pagination (page 1, limit 10) when no filters are provided', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Many wishlists event',
        maintainerId: currentUserId,
      })

      for (let i = 0; i < 12; i++) {
        await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: `Wishlist ${i}`,
        })
      }

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      const result = res.body.data.wishlists
      expect(result.__typename).toBe('GetWishlistsPagedResponse')
      expect(result.data).toHaveLength(10)
      expect(result.pagination).toMatchObject({
        totalElements: 12,
        totalPages: 2,
        pageNumber: 1,
        pageSize: 10,
      })
    })

    it('should honor explicit page and limit filters', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Paginated event',
        maintainerId: currentUserId,
      })

      for (let i = 0; i < 5; i++) {
        await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: `Wishlist ${i}`,
        })
      }

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: { page: 2, limit: 2 } } })
        .expect(200)

      const result = res.body.data.wishlists
      expect(result.__typename).toBe('GetWishlistsPagedResponse')
      expect(result.data).toHaveLength(2)
      expect(result.pagination).toMatchObject({
        totalElements: 5,
        totalPages: 3,
        pageNumber: 2,
        pageSize: 2,
      })
    })

    it('should return an empty page when the user has no wishlists', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      const result = res.body.data.wishlists
      expect(result.__typename).toBe('GetWishlistsPagedResponse')
      expect(result.data).toEqual([])
      expect(result.pagination).toMatchObject({
        totalElements: 0,
        totalPages: 0,
        pageNumber: 1,
        pageSize: 10,
      })
    })

    it.each([
      { case: 'negative page', filters: { page: -1 } },
      { case: 'zero limit', filters: { limit: 0 } },
      { case: 'page as wrong type via too large limit', filters: { limit: -5 } },
    ])('should not succeed with invalid pagination filters: $case', async ({ filters }) => {
      const res = await request.post('/graphql').send({ query, variables: { filters } }).expect(200)

      expectNotSucceeded(res.body, 'wishlists')
    })

    it('should not leak wishlists between users and keep DB state unchanged (read-only query)', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Shared event',
        maintainerId: currentUserId,
      })
      await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: currentUserId,
        title: 'Mine',
      })
      const otherUserId = await fixtures.insertUser({
        email: 'other3@test.com',
        firstname: 'Other',
        lastname: 'Three',
      })
      await fixtures.insertWishlist({
        eventIds: [eventId],
        userId: otherUserId,
        title: 'Theirs',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expect(res.body.data.wishlists.data).toHaveLength(1)
      // a read-only query must not mutate the table
      await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(2)
    })
  })
})
