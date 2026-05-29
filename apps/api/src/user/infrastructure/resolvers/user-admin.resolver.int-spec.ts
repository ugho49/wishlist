import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { Authorities, uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

const GRAPHQL_PATH = '/graphql'

describe('UserAdminResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures
  let request: RequestApp
  let adminUserId: string

  beforeEach(() => {
    fixtures = getFixtures()
  })

  // ---------------------------------------------------------------------------
  // user
  // ---------------------------------------------------------------------------
  describe('Query user', () => {
    const query = /* GraphQL */ `
      query AdminGetUserById($userId: UserId!) {
        user(userId: $userId) {
          __typename
          ... on UserFull {
            id
            firstName
            lastName
            email
            birthday
            isEnabled
            pictureUrl
            authorities
          }
          ... on ForbiddenRejection {
            message
          }
          ... on UnauthorizedRejection {
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
      const unauthenticatedRequest = await getRequest()
      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })

      const res = await unauthenticatedRequest
        .post(GRAPHQL_PATH)
        .send({ query, variables: { userId: targetUserId } })
        .expect(200)

      // Unauthenticated requests must NOT resolve to a UserFull payload
      expect(res.body.data?.user?.__typename).not.toBe('UserFull')
    })

    describe('when user is authenticated as BASE_USER (non-admin)', () => {
      let baseRequest: RequestApp

      beforeEach(async () => {
        baseRequest = await getRequest({ signedAs: 'BASE_USER' })
      })

      it('should reject with ForbiddenRejection', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const res = await baseRequest
          .post(GRAPHQL_PATH)
          .send({ query, variables: { userId: targetUserId } })
          .expect(200)

        expect(res.body.data.user).toMatchObject({ __typename: 'ForbiddenRejection' })
      })
    })

    describe('when user is authenticated as ADMIN_USER', () => {
      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
        adminUserId = await fixtures.getSignedUserId('ADMIN_USER')
      })

      it('should return the user', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { userId: targetUserId } })
          .expect(200)

        // insertUser never persists a birthday, so it is always null here.
        expect(res.body.data.user).toMatchObject({
          __typename: 'UserFull',
          id: targetUserId,
          firstName: 'Target',
          lastName: 'User',
          email: 'target@test.fr',
          birthday: null,
          isEnabled: true,
          pictureUrl: null,
          authorities: [Authorities.ROLE_USER],
        })
      })

      it('should return NotFoundRejection when user does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { userId: uuid() } })
          .expect(200)

        expect(res.body.data.user).toMatchObject({ __typename: 'NotFoundRejection' })
      })

      it('should not return a user when userId is malformed', async () => {
        // UserIdSchema is a plain string transform (no uuid validation), so a malformed id passes
        // validation and reaches the DB layer; it never resolves to a UserFull payload.
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { userId: 'not-a-uuid' } })
          .expect(200)

        expect(res.body.data.user.__typename).not.toBe('UserFull')
      })
    })
  })

  // ---------------------------------------------------------------------------
  // users (pagination)
  // ---------------------------------------------------------------------------
  describe('Query users', () => {
    const query = /* GraphQL */ `
      query AdminGetAllUsers($input: AdminGetAllUsersPaginationFilters) {
        users(input: $input) {
          __typename
          ... on AdminGetAllUsers {
            data {
              id
              email
              firstName
              lastName
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
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post(GRAPHQL_PATH)
        .send({ query, variables: { input: {} } })
        .expect(200)

      expect(res.body.data?.users?.__typename).not.toBe('AdminGetAllUsers')
    })

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const baseRequest = await getRequest({ signedAs: 'BASE_USER' })

      const res = await baseRequest
        .post(GRAPHQL_PATH)
        .send({ query, variables: { input: {} } })
        .expect(200)

      expect(res.body.data.users).toMatchObject({ __typename: 'ForbiddenRejection' })
    })

    describe('when user is authenticated as ADMIN_USER', () => {
      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it('should return a paginated list of users', async () => {
        // The signed-in ADMIN_USER already counts as one user.
        await fixtures.insertUser({ email: 'a@test.fr', firstname: 'Alice', lastname: 'A' })
        await fixtures.insertUser({ email: 'b@test.fr', firstname: 'Bob', lastname: 'B' })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { input: { page: 1, limit: 50 } } })
          .expect(200)

        expect(res.body.data.users.__typename).toBe('AdminGetAllUsers')
        expect(res.body.data.users.pagination).toMatchObject({
          totalElements: 3,
          pageNumber: 1,
          pageSize: 50,
        })
        expect(res.body.data.users.data).toHaveLength(3)
      })

      it('should respect pagination (limit / page)', async () => {
        await fixtures.insertUser({ email: 'a@test.fr', firstname: 'Alice', lastname: 'A' })
        await fixtures.insertUser({ email: 'b@test.fr', firstname: 'Bob', lastname: 'B' })

        const firstPage = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { input: { page: 1, limit: 2 } } })
          .expect(200)

        expect(firstPage.body.data.users.data).toHaveLength(2)
        expect(firstPage.body.data.users.pagination).toMatchObject({
          totalElements: 3,
          totalPages: 2,
          pageNumber: 1,
          pageSize: 2,
        })

        const secondPage = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { input: { page: 2, limit: 2 } } })
          .expect(200)

        expect(secondPage.body.data.users.data).toHaveLength(1)
        expect(secondPage.body.data.users.pagination).toMatchObject({
          totalElements: 3,
          pageNumber: 2,
          pageSize: 2,
        })
      })

      it('should filter by criteria', async () => {
        await fixtures.insertUser({ email: 'alice@test.fr', firstname: 'Alice', lastname: 'Wonder' })
        await fixtures.insertUser({ email: 'bob@test.fr', firstname: 'Bob', lastname: 'Builder' })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { input: { criteria: 'alice' } } })
          .expect(200)

        expect(res.body.data.users.__typename).toBe('AdminGetAllUsers')
        expect(res.body.data.users.data).toHaveLength(1)
        expect(res.body.data.users.data[0]).toMatchObject({ email: 'alice@test.fr' })
      })

      it.each([
        { input: { page: 0 }, case: 'page below minimum' },
        { input: { limit: 0 }, case: 'limit below minimum' },
      ])('should return ValidationRejection when $case', async ({ input }) => {
        const res = await request.post(GRAPHQL_PATH).send({ query, variables: { input } }).expect(200)

        expect(res.body.data.users).toMatchObject({ __typename: 'ValidationRejection' })
      })
    })
  })

  // ---------------------------------------------------------------------------
  // adminUpdateUserProfile
  // ---------------------------------------------------------------------------
  describe('Mutation adminUpdateUserProfile', () => {
    const mutation = /* GraphQL */ `
      mutation AdminUpdateUserProfile($userId: UserId!, $input: AdminUpdateUserProfileInput!) {
        adminUpdateUserProfile(userId: $userId, input: $input) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
          ... on UnauthorizedRejection {
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
      const unauthenticatedRequest = await getRequest()
      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })

      const res = await unauthenticatedRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { userId: targetUserId, input: { firstname: 'Hacked' } } })
        .expect(200)

      expect(res.body.data?.adminUpdateUserProfile?.__typename).not.toBe('VoidOutput')

      // No DB change: only the target user exists, unchanged.
      await expectTable(Fixtures.USER_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .toMatchObject({ id: targetUserId, first_name: 'Target' })
    })

    it('should reject a BASE_USER with ForbiddenRejection and not modify the user', async () => {
      const baseRequest = await getRequest({ signedAs: 'BASE_USER' })
      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })

      const res = await baseRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { userId: targetUserId, input: { firstname: 'Hacked' } } })
        .expect(200)

      expect(res.body.data.adminUpdateUserProfile).toMatchObject({ __typename: 'ForbiddenRejection' })

      // BASE_USER (test@test.fr) + target (target@test.fr) = 2 rows, sorted email ASC ->
      // 'target@test.fr' < 'test@test.fr', so the target is at index 0 and must be unchanged.
      await expectTable(Fixtures.USER_TABLE, { email: 'ASC' })
        .hasNumberOfRows(2)
        .row(0)
        .toMatchObject({ id: targetUserId, first_name: 'Target' })
    })

    describe('when user is authenticated as ADMIN_USER', () => {
      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
        adminUserId = await fixtures.getSignedUserId('ADMIN_USER')
      })

      it('should update the user profile and persist changes', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const birthday = DateTime.fromObject({ year: 1990, month: 1, day: 15 }).toISODate()

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: {
              userId: targetUserId,
              input: {
                email: 'updated@test.fr',
                firstname: 'Updated',
                lastname: 'Name',
                birthday,
                isEnabled: false,
              },
            },
          })
          .expect(200)

        expect(res.body.data.adminUpdateUserProfile).toEqual({ __typename: 'VoidOutput', success: true })

        // ADMIN_USER (admin@admin.fr) sorts before updated@test.fr -> target at index 1.
        // Email is lowercased by the use-case (already lowercase here); isEnabled is applied as-is.
        // The `birthday` column is a `date` stored from `new Date('1990-01-15')`.
        await expectTable(Fixtures.USER_TABLE, { email: 'ASC' })
          .row(1)
          .toMatchObject({
            id: targetUserId,
            email: 'updated@test.fr',
            first_name: 'Updated',
            last_name: 'Name',
            birthday: new Date('1990-01-15'),
            is_enabled: false,
          })
      })

      it('should return UnauthorizedRejection when admin updates themselves', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: adminUserId, input: { firstname: 'Self' } } })
          .expect(200)

        expect(res.body.data.adminUpdateUserProfile).toMatchObject({ __typename: 'UnauthorizedRejection' })
      })

      it('should return UnauthorizedRejection when admin tries to update another admin', async () => {
        const otherAdminId = await fixtures.insertUser({
          email: 'other-admin@test.fr',
          firstname: 'Other',
          lastname: 'Admin',
          authorities: [Authorities.ROLE_ADMIN],
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: otherAdminId, input: { firstname: 'Changed' } } })
          .expect(200)

        expect(res.body.data.adminUpdateUserProfile).toMatchObject({ __typename: 'UnauthorizedRejection' })

        // admin@admin.fr (signed) < other-admin@test.fr -> other admin at index 1, unchanged.
        await expectTable(Fixtures.USER_TABLE, { email: 'ASC' })
          .row(1)
          .toMatchObject({ id: otherAdminId, first_name: 'Other' })
      })

      it('should return NotFoundRejection when user does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: uuid(), input: { firstname: 'Ghost' } } })
          .expect(200)

        expect(res.body.data.adminUpdateUserProfile).toMatchObject({ __typename: 'NotFoundRejection' })
      })

      it.each([
        { input: { email: 'not-an-email' }, case: 'invalid email' },
        { input: { newPassword: 'short' }, case: 'password too short' },
        { input: { firstname: '' }, case: 'empty firstname' },
        { input: { birthday: 'not-a-date' }, case: 'invalid birthday' },
      ])('should return ValidationRejection when $case', async ({ input }) => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: targetUserId, input } })
          .expect(200)

        expect(res.body.data.adminUpdateUserProfile).toMatchObject({ __typename: 'ValidationRejection' })
      })
    })
  })

  // ---------------------------------------------------------------------------
  // adminDeleteUser
  // ---------------------------------------------------------------------------
  describe('Mutation adminDeleteUser', () => {
    const mutation = /* GraphQL */ `
      mutation AdminDeleteUser($userId: UserId!) {
        adminDeleteUser(userId: $userId) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when unauthenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })

      const res = await unauthenticatedRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { userId: targetUserId } })
        .expect(200)

      expect(res.body.data?.adminDeleteUser?.__typename).not.toBe('VoidOutput')

      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)
    })

    it('should reject a BASE_USER with ForbiddenRejection and not delete the user', async () => {
      const baseRequest = await getRequest({ signedAs: 'BASE_USER' })
      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })

      const res = await baseRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { userId: targetUserId } })
        .expect(200)

      expect(res.body.data.adminDeleteUser).toMatchObject({ __typename: 'ForbiddenRejection' })

      // BASE_USER (signed) + target user = 2 rows, nothing deleted.
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(2)
    })

    describe('when user is authenticated as ADMIN_USER', () => {
      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
        adminUserId = await fixtures.getSignedUserId('ADMIN_USER')
      })

      it('should delete the user and persist the deletion', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        // ADMIN_USER (signed) + target user = 2 rows before deletion.
        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(2)

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: targetUserId } })
          .expect(200)

        expect(res.body.data.adminDeleteUser).toEqual({ __typename: 'VoidOutput', success: true })

        // Only the signed-in admin remains.
        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1).row(0).toMatchObject({ id: adminUserId })
      })

      it('should return UnauthorizedRejection when admin deletes themselves', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: adminUserId } })
          .expect(200)

        expect(res.body.data.adminDeleteUser).toMatchObject({ __typename: 'UnauthorizedRejection' })

        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)
      })

      it('should return UnauthorizedRejection when admin tries to delete another admin', async () => {
        const otherAdminId = await fixtures.insertUser({
          email: 'other-admin@test.fr',
          firstname: 'Other',
          lastname: 'Admin',
          authorities: [Authorities.ROLE_ADMIN],
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: otherAdminId } })
          .expect(200)

        expect(res.body.data.adminDeleteUser).toMatchObject({ __typename: 'UnauthorizedRejection' })

        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(2)
      })

      it('should return NotFoundRejection when user does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: uuid() } })
          .expect(200)

        expect(res.body.data.adminDeleteUser).toMatchObject({ __typename: 'NotFoundRejection' })

        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // adminRemoveUserPicture
  // ---------------------------------------------------------------------------
  describe('Mutation adminRemoveUserPicture', () => {
    const mutation = /* GraphQL */ `
      mutation AdminRemoveUserPicture($userId: UserId!) {
        adminRemoveUserPicture(userId: $userId) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when unauthenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })

      const res = await unauthenticatedRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { userId: targetUserId } })
        .expect(200)

      expect(res.body.data?.adminRemoveUserPicture?.__typename).not.toBe('VoidOutput')
    })

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const baseRequest = await getRequest({ signedAs: 'BASE_USER' })
      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })

      const res = await baseRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { userId: targetUserId } })
        .expect(200)

      expect(res.body.data.adminRemoveUserPicture).toMatchObject({ __typename: 'ForbiddenRejection' })
    })

    describe('when user is authenticated as ADMIN_USER', () => {
      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' })
      })

      it('should remove the user picture and persist the change', async () => {
        const targetUserId = await fixtures.insertUser({
          email: 'target@test.fr',
          firstname: 'Target',
          lastname: 'User',
        })

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: targetUserId } })
          .expect(200)

        expect(res.body.data.adminRemoveUserPicture).toEqual({ __typename: 'VoidOutput', success: true })

        // admin@admin.fr (signed) < target@test.fr -> target at index 1.
        await expectTable(Fixtures.USER_TABLE, { email: 'ASC' })
          .row(1)
          .toMatchObject({ id: targetUserId, picture_url: null })
      })

      it('should return NotFoundRejection when user does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { userId: uuid() } })
          .expect(200)

        expect(res.body.data.adminRemoveUserPicture).toMatchObject({ __typename: 'NotFoundRejection' })
      })
    })
  })
})
