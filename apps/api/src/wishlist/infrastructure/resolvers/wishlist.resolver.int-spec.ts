import type { RequestApp } from '@wishlist/api-test-utils'

import { BASE_USER_EMAIL, Factories, Tables, useTestApp } from '@wishlist/api-test-utils'
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
  const { getRequest, getFactories, expectTable } = useTestApp()
  let factories: Factories
  let request: RequestApp
  let currentUserId: string

  beforeEach(async () => {
    factories = getFactories()
    request = await getRequest({ signedAs: 'BASE_USER' })
    currentUserId = await factories.getSignedUserId('BASE_USER')
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
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })
      const { id: wishlistId } = await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: currentUserId,
        title: 'My wishlist',
      })

      const res = await unauthenticated
        .post('/graphql')
        .send({ query, variables: { id: wishlistId } })
        .expect(200)

      expectNotSucceeded(res.body, 'wishlist')
    })

    it('should return the wishlist with nested owner, coOwner and events on happy path', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Birthday',
        description: 'Birthday party',
        maintainerId: currentUserId,
      })

      const {
        user: { id: coOwnerId },
      } = await factories.user.createAndJoinEvent({
        email: 'co-owner@test.com',
        firstName: 'Co',
        lastName: 'Owner',
        eventId,
      })

      const { id: wishlistId } = await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: currentUserId,
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
          email: BASE_USER_EMAIL,
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
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Event without co-owner',
        maintainerId: currentUserId,
      })
      const { id: wishlistId } = await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: currentUserId,
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
      const {
        event: { id: accessibleEventId },
      } = await factories.event.createWithMaintainer({
        title: 'Accessible event',
        maintainerId: currentUserId,
      })

      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.com',
        firstName: 'Other',
        lastName: 'User',
      })
      const {
        event: { id: hiddenEventId },
      } = await factories.event.createWithMaintainer({
        title: 'Hidden event',
        maintainerId: otherUserId,
      })

      const { id: wishlistId } = await factories.wishlist.create({
        eventIds: [accessibleEventId, hiddenEventId],
        ownerId: currentUserId,
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
      const { id: otherUserId } = await factories.user.create({
        email: 'stranger@test.com',
        firstName: 'Stranger',
        lastName: 'User',
      })
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Private event',
        maintainerId: otherUserId,
      })
      const { id: wishlistId } = await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: otherUserId,
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
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'My event',
        maintainerId: currentUserId,
      })

      const { id: myWishlistId } = await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: currentUserId,
        title: 'Mine',
      })

      // a wishlist owned by another user should NOT appear
      const { id: otherUserId } = await factories.user.create({
        email: 'other2@test.com',
        firstName: 'Other',
        lastName: 'Two',
      })
      await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: otherUserId,
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
        owner: { id: currentUserId, email: BASE_USER_EMAIL },
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
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Many wishlists event',
        maintainerId: currentUserId,
      })

      for (let i = 0; i < 12; i++) {
        await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
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
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Paginated event',
        maintainerId: currentUserId,
      })

      for (let i = 0; i < 5; i++) {
        await factories.wishlist.create({
          eventIds: [eventId],
          ownerId: currentUserId,
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
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Shared event',
        maintainerId: currentUserId,
      })
      await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: currentUserId,
        title: 'Mine',
      })
      const { id: otherUserId } = await factories.user.create({
        email: 'other3@test.com',
        firstName: 'Other',
        lastName: 'Three',
      })
      await factories.wishlist.create({
        eventIds: [eventId],
        ownerId: otherUserId,
        title: 'Theirs',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: {} } })
        .expect(200)

      expect(res.body.data.wishlists.data).toHaveLength(1)
      // a read-only query must not mutate the table
      await expectTable(Tables.WISHLIST).hasNumberOfRows(2)
    })
  })
})
