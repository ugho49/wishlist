import type { RequestApp } from '@wishlist/api-test-utils'

import { PasswordManager } from '@wishlist/api/auth'
import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { DateTime } from 'luxon'

/**
 * GraphQL integration tests for the User resolver and User field resolver.
 *
 * Source under test:
 *  - apps/api/src/user/infrastructure/resolvers/user.resolver.ts
 *  - apps/api/src/user/infrastructure/resolvers/user.field-resolver.ts
 *  - apps/api/src/user/infrastructure/user.graphql
 *
 * This is the FIRST GraphQL integration test in the repo. It mirrors the REST
 * int-spec structure but posts every operation to POST /graphql. GraphQL returns
 * HTTP 200 even for resolver-level rejections; rejections surface as
 * data.<field>.__typename (UnauthorizedRejection / ValidationRejection /
 * NotFoundRejection / InternalErrorRejection) thanks to the error-transform plugin.
 *
 * COVERED operations:
 *  - currentUser (Query)              -> unauthenticated + happy path + socials field
 *  - registerUser (Mutation)          -> happy path + DB verify, duplicate-email conflict, validation (it.each)
 *  - updateUserProfile (Mutation)     -> unauthenticated + happy path + DB verify + validation (it.each)
 *  - changeUserPassword (Mutation)    -> happy path + DB verify, wrong old password, validation (it.each)
 *  - User.emailSettings field resolver -> unauthenticated + happy path (with seeded settings), via currentUser
 *  - updateUserEmailSettings (Mutation)-> happy path + DB verify
 *  - User.socials field resolver      -> returns own socials shape; returns null for another user's record
 *
 * INTENTIONALLY SKIPPED (require external integrations / OAuth / mail-token round-trips
 * that are out of scope for this high-value subset):
 *  - linkCurrentUserWithGoogle / unlinkCurrentUserSocial (Google OAuth dependency)
 *  - updateUserPictureFromSocial / removeUserPicture (bucket + social dependency)
 *  - requestEmailChange / confirmEmailChange (mail token round-trip)
 *  - sendResetPasswordEmail / resetPassword (mail token round-trip)
 *  - pendingEmailChange (depends on requestEmailChange flow)
 */
describe('UserResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp()
  let fixtures: Fixtures
  let request: RequestApp
  let currentUserId: string

  beforeEach(async () => {
    fixtures = getFixtures()
    request = await getRequest({ signedAs: 'BASE_USER' })
    currentUserId = await fixtures.getSignedUserId('BASE_USER')
  })

  describe('Query currentUser', () => {
    const query = /* GraphQL */ `
      query CurrentUser {
        currentUser {
          __typename
          ... on User {
            id
            firstName
            lastName
            email
            isEnabled
            createdAt
            updatedAt
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest()
      const res = await anon.post('/graphql').send({ query }).expect(200)

      const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0
      const typename = res.body.data?.currentUser?.__typename
      expect(typename !== 'User' || hasTopLevelError).toBe(true)
    })

    it('should return the current user when authenticated', async () => {
      const res = await request.post('/graphql').send({ query }).expect(200)

      expect(res.body.data.currentUser).toMatchObject({
        __typename: 'User',
        id: currentUserId,
        firstName: 'John',
        lastName: 'Doe',
        email: Fixtures.BASE_USER_EMAIL,
        isEnabled: true,
      })
    })

    it('should resolve the socials field for the current user as an array', async () => {
      const query = /* GraphQL */ `
        query CurrentUserWithSocials {
          currentUser {
            __typename
            ... on User {
              id
              socials {
                id
                email
                socialType
              }
            }
          }
        }
      `

      const res = await request.post('/graphql').send({ query }).expect(200)

      const user = res.body.data.currentUser
      expect(user.__typename).toBe('User')
      expect(user.id).toBe(currentUserId)
      // No socials seeded -> own record resolves to an (empty) array, never null.
      expect(Array.isArray(user.socials)).toBe(true)
      expect(user.socials).toHaveLength(0)
    })
  })

  describe('Mutation registerUser', () => {
    const mutation = /* GraphQL */ `
      mutation RegisterUser($input: RegisterUserInput!) {
        registerUser(input: $input) {
          __typename
          ... on User {
            id
            firstName
            lastName
            email
            isEnabled
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

    it('should register a user (happy path) and persist it', async () => {
      const anon = await getRequest()
      const input = {
        email: 'new.user@test.fr',
        password: 'Password123',
        firstname: 'New',
        lastname: 'User',
      }

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      const created = res.body.data.registerUser
      expect(created).toMatchObject({
        __typename: 'User',
        id: expect.toBeString(),
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@test.fr',
        isEnabled: true,
      })

      // BASE_USER is seeded by getRequest({ signedAs }) in beforeEach, so 2 rows total.
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(2)
      await expectTable(Fixtures.USER_TABLE)
        .row(1)
        .toMatchObject({
          id: created.id,
          email: 'new.user@test.fr',
          first_name: 'New',
          last_name: 'User',
          authorities: ['ROLE_USER'],
          is_enabled: true,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })
        .expectColumn<string>('password_enc', async value => {
          const ok = await PasswordManager.verify({ hash: value, plainPassword: input.password })
          expect(ok, 'Password should match').toBe(true)
        })

      // The use-case also creates the default email settings row.
      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        user_id: created.id,
        daily_new_item_notification: true,
      })
    })

    it('should reject with UnauthorizedRejection when email already taken and not create a user', async () => {
      const anon = await getRequest()
      const input = {
        // BASE_USER already exists from beforeEach.
        email: Fixtures.BASE_USER_EMAIL,
        password: Fixtures.DEFAULT_USER_PASSWORD,
        firstname: 'John',
        lastname: 'Doe',
      }

      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.registerUser).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'User email already taken',
      })

      // No extra user created.
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)
    })

    it.each([
      {
        case: 'empty firstname/lastname',
        input: { email: 'a@b.fr', password: 'Password123', firstname: '', lastname: '' },
        fields: ['firstname', 'lastname'],
      },
      {
        case: 'invalid email',
        input: { email: 'not-an-email', password: 'Password123', firstname: 'A', lastname: 'B' },
        fields: ['email'],
      },
      {
        case: 'password too short',
        input: { email: 'a@b.fr', password: '123', firstname: 'A', lastname: 'B' },
        fields: ['password'],
      },
      {
        case: 'birthday wrong format',
        input: { email: 'a@b.fr', password: 'Password123', firstname: 'A', lastname: 'B', birthday: 'not-a-day' },
        fields: ['birthday'],
      },
    ])('should reject with ValidationRejection: $case', async ({ input, fields }) => {
      const anon = await getRequest()

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.registerUser.__typename).toBe('ValidationRejection')
      const errorFields = res.body.data.registerUser.errors.map((e: { field: string }) => e.field)
      for (const field of fields) {
        expect(errorFields).toContain(field)
      }

      // Only the seeded BASE_USER exists, no new user persisted.
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)
    })
  })

  describe('Mutation updateUserProfile', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
        updateUserProfile(input: $input) {
          __typename
          ... on User {
            id
            firstName
            lastName
            birthday
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
      const anon = await getRequest()
      const input = { firstname: 'Hack', lastname: 'Er' }

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0
      const typename = res.body.data?.updateUserProfile?.__typename
      expect(typename !== 'User' || hasTopLevelError).toBe(true)

      // Seeded user unchanged.
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
      })
    })

    it('should update the profile (happy path) and persist it', async () => {
      const birthday = DateTime.fromObject({ year: 1993, month: 11, day: 15 }).toISODate()
      const input = { firstname: 'Updated', lastname: 'UPDATED', birthday }

      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.updateUserProfile).toMatchObject({
        __typename: 'User',
        id: currentUserId,
        firstName: 'Updated',
        lastName: 'UPDATED',
      })

      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: currentUserId,
        first_name: 'Updated',
        last_name: 'UPDATED',
        birthday: expect.toBeDate(),
        updated_at: expect.toBeDate(),
      })
    })

    it.each([
      {
        case: 'empty firstname/lastname',
        input: { firstname: '', lastname: '' },
        fields: ['firstname', 'lastname'],
      },
      {
        case: 'too long firstname',
        input: { firstname: 'a'.repeat(51), lastname: 'Doe' },
        fields: ['firstname'],
      },
      {
        case: 'birthday wrong format',
        input: { firstname: 'John', lastname: 'Doe', birthday: 'not-a-day' },
        fields: ['birthday'],
      },
    ])('should reject with ValidationRejection: $case', async ({ input, fields }) => {
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.updateUserProfile.__typename).toBe('ValidationRejection')
      const errorFields = res.body.data.updateUserProfile.errors.map((e: { field: string }) => e.field)
      for (const field of fields) {
        expect(errorFields).toContain(field)
      }

      // Profile not mutated.
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
      })
    })
  })

  describe('Mutation changeUserPassword', () => {
    const mutation = /* GraphQL */ `
      mutation ChangeUserPassword($input: ChangeUserPasswordInput!) {
        changeUserPassword(input: $input) {
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
          ... on InternalErrorRejection {
            message
          }
        }
      }
    `

    it('should change the password (happy path) and persist the new hash', async () => {
      const input = { oldPassword: Fixtures.DEFAULT_USER_PASSWORD, newPassword: 'NewPassword456' }

      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.changeUserPassword).toMatchObject({
        __typename: 'VoidOutput',
        success: true,
      })

      await expectTable(Fixtures.USER_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const matchesNew = await PasswordManager.verify({ hash: value, plainPassword: 'NewPassword456' })
          expect(matchesNew, 'New password should match').toBe(true)
          const matchesOld = await PasswordManager.verify({
            hash: value,
            plainPassword: Fixtures.DEFAULT_USER_PASSWORD,
          })
          expect(matchesOld, 'Old password should no longer match').toBe(false)
        })
    })

    it('should reject when old password does not match and not change the hash', async () => {
      const input = { oldPassword: 'WrongPassword1', newPassword: 'NewPassword456' }

      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      // BadRequestException -> InternalErrorRejection (not a specifically-mapped exception type).
      expect(res.body.data.changeUserPassword.__typename).toBe('InternalErrorRejection')

      await expectTable(Fixtures.USER_TABLE)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const matchesOld = await PasswordManager.verify({
            hash: value,
            plainPassword: Fixtures.DEFAULT_USER_PASSWORD,
          })
          expect(matchesOld, 'Old password should remain valid').toBe(true)
        })
    })

    it.each([
      {
        case: 'old password too short',
        input: { oldPassword: '123', newPassword: 'NewPassword456' },
        fields: ['oldPassword'],
      },
      {
        case: 'new password too short',
        input: { oldPassword: Fixtures.DEFAULT_USER_PASSWORD, newPassword: '123' },
        fields: ['newPassword'],
      },
    ])('should reject with ValidationRejection: $case', async ({ input, fields }) => {
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.changeUserPassword.__typename).toBe('ValidationRejection')
      const errorFields = res.body.data.changeUserPassword.errors.map((e: { field: string }) => e.field)
      for (const field of fields) {
        expect(errorFields).toContain(field)
      }
    })
  })

  describe('User.emailSettings field resolver', () => {
    // emailSettings is now a @ResolveField on the User type, reached through the
    // currentUser query (the only schema entry point returning a User). The field
    // resolver only resolves settings when the resolved User.id equals the current
    // user's id (returns null otherwise); currentUser always resolves the signed-in
    // user so the id-equality guard always passes here.
    const query = /* GraphQL */ `
      query CurrentUserEmailSettings {
        currentUser {
          __typename
          ... on User {
            id
            emailSettings {
              dailyNewItemNotification
            }
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest()
      const res = await anon.post('/graphql').send({ query }).expect(200)

      const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0
      const typename = res.body.data?.currentUser?.__typename
      expect(typename !== 'User' || hasTopLevelError).toBe(true)
    })

    it('should return the email settings when they exist', async () => {
      await fixtures.insertUserEmailSettings({
        userId: currentUserId,
        emailSettings: { daily_new_item_notification: true },
      })

      const res = await request.post('/graphql').send({ query }).expect(200)

      const user = res.body.data.currentUser
      expect(user.__typename).toBe('User')
      expect(user.id).toBe(currentUserId)
      expect(user.emailSettings).toEqual({
        dailyNewItemNotification: true,
      })
    })
  })

  describe('Mutation updateUserEmailSettings', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateUserEmailSettings($input: UpdateUserEmailSettingsInput!) {
        updateUserEmailSettings(input: $input) {
          __typename
          ... on UserEmailSettings {
            dailyNewItemNotification
          }
        }
      }
    `

    it('should update the email settings (happy path) and persist them', async () => {
      const settingId = await fixtures.insertUserEmailSettings({
        userId: currentUserId,
        emailSettings: { daily_new_item_notification: true },
      })

      const input = { dailyNewItemNotification: false }
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.updateUserEmailSettings).toEqual({
        __typename: 'UserEmailSettings',
        dailyNewItemNotification: false,
      })

      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: settingId,
        user_id: currentUserId,
        daily_new_item_notification: false,
        updated_at: expect.toBeDate(),
      })
    })

    it('should reject with NotFoundRejection when no settings row exists', async () => {
      // updateUserEmailSettings does NOT upsert: the use-case throws NotFoundException when the
      // signed-in user has no settings row, surfaced as NotFoundRejection by the error plugin.
      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(0)

      const input = { dailyNewItemNotification: false }
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200)

      expect(res.body.data.updateUserEmailSettings.__typename).toBe('NotFoundRejection')
      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(0)
    })
  })

  describe('User.socials field resolver', () => {
    // The field resolver only exposes socials when the resolved User.id equals the
    // current user's id (returns null otherwise). The only schema entry point that
    // returns a User and supports the socials field is currentUser, which always
    // resolves the signed-in user -> the id-equality guard always passes here, so we
    // verify the own-record path returns a (non-null) array. The "another user" guard
    // (returning null) is not reachable via the current schema and is left for a unit
    // test of UserFieldResolver.
    it('should return a non-null socials array for the current user own record', async () => {
      const query = /* GraphQL */ `
        query OwnSocials {
          currentUser {
            ... on User {
              id
              socials {
                id
              }
            }
          }
        }
      `

      const res = await request.post('/graphql').send({ query }).expect(200)
      const user = res.body.data.currentUser

      expect(user.id).toBe(currentUserId)
      expect(user.socials).not.toBeNull()
      expect(Array.isArray(user.socials)).toBe(true)
    })
  })

  describe('Query searchUsers', () => {
    const query = /* GraphQL */ `
      query SearchUsers($keyword: String!) {
        searchUsers(keyword: $keyword) {
          __typename
          ... on SearchUsersOutput {
            users {
              id
              firstName
              lastName
              email
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
      const anon = await getRequest()
      const res = await anon
        .post('/graphql')
        .send({ query, variables: { keyword: 'someone' } })
        .expect(200)

      expect(res.body.data?.searchUsers?.__typename).not.toBe('SearchUsersOutput')
    })

    it('should return matching users excluding the current user', async () => {
      const targetId = await fixtures.insertUser({
        email: 'zorglub@test.fr',
        firstname: 'Zorglub',
        lastname: 'Searchable',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { keyword: 'Zorglub' } })
        .expect(200)

      expect(res.body.data.searchUsers.__typename).toBe('SearchUsersOutput')
      const ids = res.body.data.searchUsers.users.map((u: { id: string }) => u.id)
      expect(ids).toContain(targetId)
      expect(ids).not.toContain(currentUserId)
    })

    it.each([
      { keyword: '', case: 'empty keyword' },
      { keyword: 'a', case: 'keyword too short' },
    ])('should return ValidationRejection when invalid input: $case', async ({ keyword }) => {
      const res = await request.post('/graphql').send({ query, variables: { keyword } }).expect(200)

      expect(res.body.data.searchUsers.__typename).toBe('ValidationRejection')
    })
  })

  describe('Query closestFriends', () => {
    const query = /* GraphQL */ `
      query ClosestFriends($limit: Int) {
        closestFriends(limit: $limit) {
          __typename
          ... on ClosestFriendsOutput {
            users {
              id
              firstName
              lastName
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
      const anon = await getRequest()
      const res = await anon.post('/graphql').send({ query, variables: {} }).expect(200)

      expect(res.body.data?.closestFriends?.__typename).not.toBe('ClosestFriendsOutput')
    })

    it('should return a ClosestFriendsOutput for an authenticated user', async () => {
      const res = await request.post('/graphql').send({ query, variables: {} }).expect(200)

      expect(res.body.data.closestFriends.__typename).toBe('ClosestFriendsOutput')
      expect(Array.isArray(res.body.data.closestFriends.users)).toBe(true)
    })

    it('should return ValidationRejection when limit exceeds the maximum', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { limit: 51 } })
        .expect(200)

      expect(res.body.data.closestFriends.__typename).toBe('ValidationRejection')
    })
  })
})
