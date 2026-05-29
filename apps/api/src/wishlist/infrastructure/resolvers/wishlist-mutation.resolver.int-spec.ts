import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { uuid } from '@wishlist/common'

const GRAPHQL_PATH = '/graphql'

/**
 * Integration tests for the GraphQL WishlistMutationResolver.
 *
 * GraphQL always returns HTTP 200; thrown Nest exceptions are mapped to typed
 * rejections placed at data.<field>:
 *   ZodValidationException -> ValidationRejection
 *   UnauthorizedException  -> UnauthorizedRejection
 *   NotFoundException      -> NotFoundRejection
 *   ForbiddenException     -> ForbiddenRejection
 *   other HttpException    -> InternalErrorRejection
 */
describe('WishlistMutationResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  // ---------------------------------------------------------------------------
  // updateWishlist
  // ---------------------------------------------------------------------------
  describe('Mutation updateWishlist', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateWishlist($id: WishlistId!, $input: UpdateWishlistInput!) {
        updateWishlist(id: $id, input: $input) {
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
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid(), input: { title: 'Updated' } } })
        .expect(200)

      expect(res.body.data?.updateWishlist?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should update the wishlist successfully', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Original',
          description: 'Original description',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { id: wishlistId, input: { title: 'Updated', description: 'Updated description' } },
          })
          .expect(200)

        expect(res.body.data.updateWishlist).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Updated',
          description: 'Updated description',
          updated_at: expect.toBeDate(),
        })
      })

      it.each([
        { case: 'empty title', input: { title: '' }, field: 'title' },
        { case: 'title too long', input: { title: 'a'.repeat(101) }, field: 'title' },
        {
          case: 'description too long',
          input: { title: 'Valid', description: 'a'.repeat(2001) },
          field: 'description',
        },
      ])('should return ValidationRejection when invalid input: $case', async ({ input, field }) => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Original',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, input } })
          .expect(200)

        expect(res.body.data.updateWishlist.__typename).toBe('ValidationRejection')
        expect(res.body.data.updateWishlist.errors).toEqual(
          expect.arrayContaining([expect.objectContaining({ field })]),
        )

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Original',
        })
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), input: { title: 'Updated' } } })
          .expect(200)

        expect(res.body.data.updateWishlist.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user is not owner/co-owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, input: { title: 'Hacked' } } })
          .expect(200)

        expect(res.body.data.updateWishlist.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          title: 'Other Wishlist',
        })
      })
    })
  })

  // ---------------------------------------------------------------------------
  // deleteWishlist
  // ---------------------------------------------------------------------------
  describe('Mutation deleteWishlist', () => {
    const mutation = /* GraphQL */ `
      mutation DeleteWishlist($id: WishlistId!) {
        deleteWishlist(id: $id) {
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
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data?.deleteWishlist?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should delete the wishlist successfully', async () => {
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
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200)

        expect(res.body.data.deleteWishlist).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0)
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200)

        expect(res.body.data.deleteWishlist.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user is not owner/co-owner and not delete it', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200)

        expect(res.body.data.deleteWishlist.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // linkWishlistToEvent
  // ---------------------------------------------------------------------------
  describe('Mutation linkWishlistToEvent', () => {
    const mutation = /* GraphQL */ `
      mutation LinkWishlistToEvent($id: WishlistId!, $eventId: EventId!) {
        linkWishlistToEvent(id: $id, eventId: $eventId) {
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
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid(), eventId: uuid() } })
        .expect(200)

      expect(res.body.data?.linkWishlistToEvent?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should link the wishlist to another event successfully', async () => {
        const { eventId: firstEventId } = await fixtures.insertEventWithMaintainer({
          title: 'First Event',
          maintainerId: currentUserId,
        })

        const { eventId: secondEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Second Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [firstEventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, eventId: secondEventId } })
          .expect(200)

        expect(res.body.data.linkWishlistToEvent).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(2)
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), eventId } })
          .expect(200)

        expect(res.body.data.linkWishlistToEvent.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user is not owner/co-owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId: otherEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [otherEventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const { eventId: myEventId } = await fixtures.insertEventWithMaintainer({
          title: 'My Event',
          maintainerId: currentUserId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, eventId: myEventId } })
          .expect(200)

        expect(res.body.data.linkWishlistToEvent.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(1)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // unlinkWishlistFromEvent
  // ---------------------------------------------------------------------------
  describe('Mutation unlinkWishlistFromEvent', () => {
    const mutation = /* GraphQL */ `
      mutation UnlinkWishlistFromEvent($id: WishlistId!, $eventId: EventId!) {
        unlinkWishlistFromEvent(id: $id, eventId: $eventId) {
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
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid(), eventId: uuid() } })
        .expect(200)

      expect(res.body.data?.unlinkWishlistFromEvent?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should unlink the wishlist from an event successfully (keeping at least one)', async () => {
        const { eventId: firstEventId } = await fixtures.insertEventWithMaintainer({
          title: 'First Event',
          maintainerId: currentUserId,
        })

        const { eventId: secondEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Second Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [firstEventId, secondEventId],
          userId: currentUserId,
          title: 'My Wishlist',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, eventId: secondEventId } })
          .expect(200)

        expect(res.body.data.unlinkWishlistFromEvent).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          event_id: firstEventId,
          wishlist_id: wishlistId,
        })
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), eventId: uuid() } })
          .expect(200)

        expect(res.body.data.unlinkWishlistFromEvent.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user is not owner/co-owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId: firstEventId } = await fixtures.insertEventWithMaintainer({
          title: 'First Event',
          maintainerId: otherUserId,
        })

        const { eventId: secondEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Second Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [firstEventId, secondEventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, eventId: secondEventId } })
          .expect(200)

        expect(res.body.data.unlinkWishlistFromEvent.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(2)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // addWishlistCoOwner
  // ---------------------------------------------------------------------------
  describe('Mutation addWishlistCoOwner', () => {
    const mutation = /* GraphQL */ `
      mutation AddWishlistCoOwner($id: WishlistId!, $input: AddWishlistCoOwnerInput!) {
        addWishlistCoOwner(id: $id, input: $input) {
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
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid(), input: { userId: uuid() } } })
        .expect(200)

      expect(res.body.data?.addWishlistCoOwner?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should add a co-owner to a public wishlist successfully', async () => {
        const coOwnerId = await fixtures.insertUser({
          email: 'coowner@test.com',
          firstname: 'Co',
          lastname: 'Owner',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, input: { userId: coOwnerId } } })
          .expect(200)

        expect(res.body.data.addWishlistCoOwner).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: coOwnerId,
        })
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const coOwnerId = await fixtures.insertUser({
          email: 'coowner@test.com',
          firstname: 'Co',
          lastname: 'Owner',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), input: { userId: coOwnerId } } })
          .expect(200)

        expect(res.body.data.addWishlistCoOwner.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user is not the owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const coOwnerId = await fixtures.insertUser({
          email: 'coowner@test.com',
          firstname: 'Co',
          lastname: 'Owner',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
          hideItems: false,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId, input: { userId: coOwnerId } } })
          .expect(200)

        expect(res.body.data.addWishlistCoOwner.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })
      })
    })
  })

  // ---------------------------------------------------------------------------
  // removeWishlistCoOwner
  // ---------------------------------------------------------------------------
  describe('Mutation removeWishlistCoOwner', () => {
    const mutation = /* GraphQL */ `
      mutation RemoveWishlistCoOwner($id: WishlistId!) {
        removeWishlistCoOwner(id: $id) {
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
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data?.removeWishlistCoOwner?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should remove the co-owner successfully', async () => {
        const coOwnerId = await fixtures.insertUser({
          email: 'coowner@test.com',
          firstname: 'Co',
          lastname: 'Owner',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          maintainerId: currentUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: currentUserId,
          title: 'Public Wishlist',
          hideItems: false,
          coOwnerId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200)

        expect(res.body.data.removeWishlistCoOwner).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: null,
        })
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200)

        expect(res.body.data.removeWishlistCoOwner.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user is not the owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const coOwnerId = await fixtures.insertUser({
          email: 'coowner@test.com',
          firstname: 'Co',
          lastname: 'Owner',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
          hideItems: false,
          coOwnerId,
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200)

        expect(res.body.data.removeWishlistCoOwner.__typename).toBe('UnauthorizedRejection')

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          co_owner_id: coOwnerId,
        })
      })
    })
  })

  // ---------------------------------------------------------------------------
  // removeWishlistLogo
  // ---------------------------------------------------------------------------
  describe('Mutation removeWishlistLogo', () => {
    const mutation = /* GraphQL */ `
      mutation RemoveWishlistLogo($id: WishlistId!) {
        removeWishlistLogo(id: $id) {
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
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid() } })
        .expect(200)

      expect(res.body.data?.removeWishlistLogo?.__typename).not.toBe('VoidOutput')
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
      })

      it('should remove the wishlist logo successfully', async () => {
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
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200)

        expect(res.body.data.removeWishlistLogo).toEqual({ __typename: 'VoidOutput', success: true })

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: wishlistId,
          logo_url: null,
        })
      })

      it('should return NotFoundRejection when wishlist does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200)

        expect(res.body.data.removeWishlistLogo.__typename).toBe('NotFoundRejection')
      })

      it('should return UnauthorizedRejection when user is not owner/co-owner', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        })

        const wishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: otherUserId,
          title: 'Other Wishlist',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: wishlistId } })
          .expect(200)

        expect(res.body.data.removeWishlistLogo.__typename).toBe('UnauthorizedRejection')
      })
    })
  })
})
