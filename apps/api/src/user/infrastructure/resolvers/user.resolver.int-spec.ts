import type { RequestApp } from '@wishlist/api-test-utils';

import { createHmac } from 'node:crypto';
import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { DateTime } from 'luxon';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { emailSubject } from '../../../core/rate-limit/rate-limit.policies';

function signAccessToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS512', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const signature = createHmac('sha512', process.env.AUTH_ACCESS_TOKEN_SECRET ?? '')
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

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
 *  - currentUser (Query)              -> unauthenticated + happy path + accounts field
 *  - registerUser (Mutation)          -> happy path + DB verify, duplicate-email conflict, validation (it.each), RATE_LIMITED
 *  - updateUserProfile (Mutation)     -> unauthenticated + happy path + DB verify + validation (it.each)
 *  - changeUserPassword (Mutation)    -> happy path + DB verify, wrong old password, validation (it.each)
 *  - CurrentUser.emailSettings field resolver -> unauthenticated + happy path (with seeded settings), via currentUser
 *  - updateUserEmailSettings (Mutation)-> happy path + DB verify
 *  - CurrentUser.accounts field resolver -> returns own accounts shape
 *  - searchUsers (Query)              -> circle only, literal keyword, disabled users excluded
 *  - userByEmail (Query)              -> exact email, public fields only, RATE_LIMITED
 *  - sendResetPasswordEmail (Mutation)-> same answer whether the email has an account or not, pending code sent again, RATE_LIMITED
 *
 * INTENTIONALLY SKIPPED (require external integrations / OAuth / mail-token round-trips
 * that are out of scope for this high-value subset):
 *  - linkCurrentUserWithGoogle / unlinkCurrentUserAccount (Google OAuth dependency)
 *  - updateUserPictureFromAccount / removeUserPicture (bucket + account dependency)
 *  - requestEmailChange / confirmEmailChange (mail token round-trip)
 *  - resetPassword (mail token round-trip)
 *  - pendingEmailChange (depends on requestEmailChange flow)
 */
describe('UserResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable, expectMail, clearMails, fillRateLimit, runSql } = useTestApp();
  let fixtures: Fixtures;
  let request: RequestApp;
  let currentUserId: string;

  beforeEach(async () => {
    fixtures = getFixtures();
    request = await getRequest({ signedAs: 'BASE_USER' });
    currentUserId = await fixtures.getSignedUserId('BASE_USER');
  });

  describe('Query currentUser', () => {
    const query = /* GraphQL */ `
      query CurrentUser {
        currentUser {
          __typename
          ... on CurrentUser {
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
    `;

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const res = await anon.post('/graphql').send({ query }).expect(200);

      const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
      const typename = res.body.data?.currentUser?.__typename;
      expect(typename !== 'CurrentUser' || hasTopLevelError).toBe(true);
    });

    it('should reject an access token without a session id', async () => {
      const email = 'legacy-token@test.fr';
      const userId = await fixtures.insertUser({
        email,
        firstname: 'Legacy',
        lastname: 'Token',
      });
      const now = Math.floor(Date.now() / 1000);
      const token = signAccessToken({
        sub: userId,
        email,
        authorities: ['ROLE_USER'],
        iat: now,
        exp: now + 15 * 60,
      });

      const anon = await getRequest();
      const res = await anon.post('/graphql').auth(token, { type: 'bearer' }).send({ query }).expect(200);

      const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
      const typename = res.body.data?.currentUser?.__typename;
      expect(typename !== 'CurrentUser' || hasTopLevelError).toBe(true);
    });

    it('should return the current user when authenticated', async () => {
      const res = await request.post('/graphql').send({ query }).expect(200);

      expect(res.body.data.currentUser).toMatchObject({
        __typename: 'CurrentUser',
        id: currentUserId,
        firstName: 'John',
        lastName: 'Doe',
        email: Fixtures.BASE_USER_EMAIL,
        isEnabled: true,
      });
    });

    it('should resolve the sessions field for the current user', async () => {
      const queryWithSessions = /* GraphQL */ `
        query CurrentUserWithSessions {
          currentUser {
            __typename
            ... on CurrentUser {
              id
              sessions {
                id
                ip
                current
                createdAt
                lastUsedAt
                expiresAt
                device {
                  browser
                  os
                  type
                  label
                }
              }
            }
          }
        }
      `;

      const res = await request.post('/graphql').send({ query: queryWithSessions }).expect(200);

      const user = res.body.data.currentUser;
      expect(user.__typename).toBe('CurrentUser');
      expect(user.sessions).toHaveLength(1);
      expect(user.sessions[0]).toMatchObject({
        id: expect.toBeString(),
        current: true,
        createdAt: expect.toBeString(),
        lastUsedAt: expect.toBeString(),
        expiresAt: expect.toBeString(),
        device: {
          browser: expect.toBeString(),
          os: expect.toBeString(),
          type: expect.toBeString(),
          label: expect.toBeString(),
        },
      });
    });

    it('should resolve the accounts field for the current user as an array', async () => {
      const queryWithAccounts = /* GraphQL */ `
        query CurrentUserWithAccounts {
          currentUser {
            __typename
            ... on CurrentUser {
              id
              accounts {
                id
                email
                provider
              }
            }
          }
        }
      `;

      const res = await request.post('/graphql').send({ query: queryWithAccounts }).expect(200);

      const user = res.body.data.currentUser;
      expect(user.__typename).toBe('CurrentUser');
      expect(user.id).toBe(currentUserId);
      // Password accounts are not exposed; no social accounts seeded -> empty array, never null.
      expect(Array.isArray(user.accounts)).toBe(true);
      expect(user.accounts).toHaveLength(0);
    });
  });

  describe('Mutation registerUser', () => {
    const mutation = /* GraphQL */ `
      mutation RegisterUser($input: RegisterUserInput!) {
        registerUser(input: $input) {
          __typename
          ... on CurrentUser {
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
          ... on BusinessRuleRejection {
            code
          }
        }
      }
    `;

    it('should register a user (happy path) and persist it', async () => {
      const anon = await getRequest();
      const input = {
        email: 'new.user@test.fr',
        password: 'Password123',
        firstname: 'New',
        lastname: 'User',
      };

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      const created = res.body.data.registerUser;
      expect(created).toMatchObject({
        __typename: 'CurrentUser',
        id: expect.toBeString(),
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@test.fr',
        isEnabled: true,
      });

      // BASE_USER is seeded by getRequest({ signedAs }) in beforeEach, so 2 rows total.
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(2);
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
        });

      await expectTable(Fixtures.USER_ACCOUNT_TABLE, { created_at: 'ASC' })
        .hasNumberOfRows(2)
        .row(1)
        .toMatchObject({
          user_id: created.id,
          provider: 'password',
          email: 'new.user@test.fr',
        })
        .expectColumn<string>('password_hash', async value => {
          const ok = await PasswordManager.verify({ hash: value, plainPassword: input.password });
          expect(ok, 'Password should match').toBe(true);
        });

      // The use-case also creates the default email settings row.
      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        user_id: created.id,
        daily_new_item_notification: true,
      });
    });

    it('should reject with an EMAIL_ALREADY_TAKEN BusinessRuleRejection when email already taken and not create a user', async () => {
      const anon = await getRequest();
      const input = {
        // BASE_USER already exists from beforeEach.
        email: Fixtures.BASE_USER_EMAIL,
        password: Fixtures.DEFAULT_USER_PASSWORD,
        firstname: 'John',
        lastname: 'Doe',
      };

      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1);

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.registerUser).toEqual({ __typename: 'BusinessRuleRejection', code: 'EMAIL_ALREADY_TAKEN' });

      // No extra user created.
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1);
    });

    it('should refuse a sign-up once the client address has used its 10 hourly sign-ups', async () => {
      const anon = await getRequest();
      const input = { email: 'new.user@test.fr', password: 'Password123', firstname: 'New', lastname: 'User' };
      await fillRateLimit('signUp:ip:203.0.113.7', 10);

      const limited = await anon
        .post('/graphql')
        .set('X-Forwarded-For', '203.0.113.7')
        .send({ query: mutation, variables: { input } })
        .expect(200);

      expect(limited.body.data.registerUser).toEqual({ __typename: 'BusinessRuleRejection', code: 'RATE_LIMITED' });
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1);

      const otherAddress = await anon
        .post('/graphql')
        .set('X-Forwarded-For', '203.0.113.8')
        .send({ query: mutation, variables: { input } })
        .expect(200);

      expect(otherAddress.body.data.registerUser.__typename).toBe('CurrentUser');
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(2);
    });

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
      const anon = await getRequest();

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.registerUser.__typename).toBe('ValidationRejection');
      const errorFields = res.body.data.registerUser.errors.map((e: { field: string }) => e.field);
      for (const field of fields) {
        expect(errorFields).toContain(field);
      }

      // Only the seeded BASE_USER exists, no new user persisted.
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1);
    });
  });

  describe('Mutation updateUserProfile', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
        updateUserProfile(input: $input) {
          __typename
          ... on CurrentUser {
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
    `;

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const input = { firstname: 'Hack', lastname: 'Er' };

      const res = await anon.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
      const typename = res.body.data?.updateUserProfile?.__typename;
      expect(typename !== 'CurrentUser' || hasTopLevelError).toBe(true);

      // Seeded user unchanged.
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
      });
    });

    it('should update the profile (happy path) and persist it', async () => {
      const birthday = DateTime.fromObject({ year: 1993, month: 11, day: 15 }).toISODate();
      const input = { firstname: 'Updated', lastname: 'UPDATED', birthday };

      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.updateUserProfile).toMatchObject({
        __typename: 'CurrentUser',
        id: currentUserId,
        firstName: 'Updated',
        lastName: 'UPDATED',
      });

      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: currentUserId,
        first_name: 'Updated',
        last_name: 'UPDATED',
        birthday: expect.toBeDate(),
        updated_at: expect.toBeDate(),
      });
    });

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
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.updateUserProfile.__typename).toBe('ValidationRejection');
      const errorFields = res.body.data.updateUserProfile.errors.map((e: { field: string }) => e.field);
      for (const field of fields) {
        expect(errorFields).toContain(field);
      }

      // Profile not mutated.
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
      });
    });
  });

  describe('Mutation setSignupSource', () => {
    const mutation = /* GraphQL */ `
      mutation SetSignupSource($input: SetSignupSourceInput!) {
        setSignupSource(input: $input) {
          __typename
          ... on CurrentUser {
            id
            signupSource
            signupSourceDetail
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
      const anon = await getRequest();
      const res = await anon
        .post('/graphql')
        .send({ query: mutation, variables: { input: { source: 'GOOGLE' } } })
        .expect(200);

      expect(res.body.data?.setSignupSource?.__typename).not.toBe('CurrentUser');
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        signup_source: null,
        signup_source_detail: null,
      });
    });

    it('should persist a known source and ignore a detail', async () => {
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { input: { source: 'FRIENDS', detail: 'ignored' } } })
        .expect(200);

      expect(res.body.data.setSignupSource).toMatchObject({
        __typename: 'CurrentUser',
        id: currentUserId,
        signupSource: 'FRIENDS',
        signupSourceDetail: null,
      });

      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        id: currentUserId,
        signup_source: 'friends',
        signup_source_detail: null,
      });
    });

    it('should persist the free-text detail when the source is other', async () => {
      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables: { input: { source: 'OTHER', detail: '  podcast  ' } } })
        .expect(200);

      expect(res.body.data.setSignupSource).toMatchObject({
        __typename: 'CurrentUser',
        signupSource: 'OTHER',
        signupSourceDetail: 'podcast',
      });

      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        signup_source: 'other',
        signup_source_detail: 'podcast',
      });
    });

    it.each([
      { case: 'other without detail', input: { source: 'OTHER' } },
      { case: 'other with blank detail', input: { source: 'OTHER', detail: '   ' } },
      { case: 'other detail too long', input: { source: 'OTHER', detail: 'a'.repeat(201) } },
    ])('should reject with ValidationRejection: $case', async ({ input }) => {
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.setSignupSource.__typename).toBe('ValidationRejection');
      const errorFields = res.body.data.setSignupSource.errors.map((error: { field: string }) => error.field);
      expect(errorFields).toContain('detail');

      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        signup_source: null,
      });
    });
  });

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
          ... on BusinessRuleRejection {
            code
            message
          }
          ... on InternalErrorRejection {
            message
          }
        }
      }
    `;

    it('should change the password (happy path) and persist the new hash', async () => {
      const input = { oldPassword: Fixtures.DEFAULT_USER_PASSWORD, newPassword: 'NewPassword456' };

      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.changeUserPassword).toMatchObject({
        __typename: 'VoidOutput',
        success: true,
      });

      await expectTable(Fixtures.USER_ACCOUNT_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .expectColumn<string>('password_hash', async value => {
          const matchesNew = await PasswordManager.verify({ hash: value, plainPassword: 'NewPassword456' });
          expect(matchesNew, 'New password should match').toBe(true);
          const matchesOld = await PasswordManager.verify({
            hash: value,
            plainPassword: Fixtures.DEFAULT_USER_PASSWORD,
          });
          expect(matchesOld, 'Old password should no longer match').toBe(false);
        });
    });

    it('should reject when old password does not match and not change the hash', async () => {
      const input = { oldPassword: 'WrongPassword1', newPassword: 'NewPassword456' };

      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.changeUserPassword).toEqual({
        __typename: 'BusinessRuleRejection',
        code: 'WRONG_OLD_PASSWORD',
        message: "Old password don't match with user password",
      });

      await expectTable(Fixtures.USER_ACCOUNT_TABLE)
        .row(0)
        .expectColumn<string>('password_hash', async value => {
          const matchesOld = await PasswordManager.verify({
            hash: value,
            plainPassword: Fixtures.DEFAULT_USER_PASSWORD,
          });
          expect(matchesOld, 'Old password should remain valid').toBe(true);
        });
    });

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
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.changeUserPassword.__typename).toBe('ValidationRejection');
      const errorFields = res.body.data.changeUserPassword.errors.map((e: { field: string }) => e.field);
      for (const field of fields) {
        expect(errorFields).toContain(field);
      }
    });
  });

  describe('CurrentUser.emailSettings field resolver', () => {
    // emailSettings is a @ResolveField on the CurrentUser type, only returned to the
    // signed-in user (currentUser query). The field resolver still checks that the
    // resolved id is the current user's id (returns null otherwise).
    const query = /* GraphQL */ `
      query CurrentUserEmailSettings {
        currentUser {
          __typename
          ... on CurrentUser {
            id
            emailSettings {
              dailyNewItemNotification
              birthdayReminder
            }
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const res = await anon.post('/graphql').send({ query }).expect(200);

      const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
      const typename = res.body.data?.currentUser?.__typename;
      expect(typename !== 'CurrentUser' || hasTopLevelError).toBe(true);
    });

    it('should return the email settings when they exist', async () => {
      await fixtures.insertUserEmailSettings({
        userId: currentUserId,
        emailSettings: { daily_new_item_notification: true, birthday_reminder: true },
      });

      const res = await request.post('/graphql').send({ query }).expect(200);

      const user = res.body.data.currentUser;
      expect(user.__typename).toBe('CurrentUser');
      expect(user.id).toBe(currentUserId);
      expect(user.emailSettings).toEqual({
        dailyNewItemNotification: true,
        birthdayReminder: true,
      });
    });
  });

  describe('Mutation updateUserEmailSettings', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateUserEmailSettings($input: UpdateUserEmailSettingsInput!) {
        updateUserEmailSettings(input: $input) {
          __typename
          ... on UserEmailSettings {
            dailyNewItemNotification
            birthdayReminder
          }
        }
      }
    `;

    it('should update the email settings (happy path) and persist them', async () => {
      const settingId = await fixtures.insertUserEmailSettings({
        userId: currentUserId,
        emailSettings: { daily_new_item_notification: true, birthday_reminder: true },
      });

      const input = { dailyNewItemNotification: false, birthdayReminder: false };
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      expect(res.body.data.updateUserEmailSettings).toEqual({
        __typename: 'UserEmailSettings',
        dailyNewItemNotification: false,
        birthdayReminder: false,
      });

      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: settingId,
        user_id: currentUserId,
        daily_new_item_notification: false,
        birthday_reminder: false,
        updated_at: expect.toBeDate(),
      });
    });

    it('should reject with InternalErrorRejection when no settings row exists', async () => {
      // updateUserEmailSettings does NOT upsert: the use-case throws NotFoundException when the
      // signed-in user has no settings row, surfaced as NotFoundRejection by the error plugin.
      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(0);

      const input = { dailyNewItemNotification: false, birthdayReminder: false };
      const res = await request.post('/graphql').send({ query: mutation, variables: { input } }).expect(200);

      // NotFoundRejection is not a member of the field's result union: the fallback is InternalErrorRejection
      expect(res.body.data.updateUserEmailSettings.__typename).toBe('InternalErrorRejection');
      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(0);
    });
  });

  describe('CurrentUser.accounts field resolver', () => {
    // The field resolver only exposes accounts when the resolved User.id equals the
    // current user's id (returns null otherwise). The only schema entry point that
    // returns a User and supports the accounts field is currentUser, which always
    // resolves the signed-in user -> the id-equality guard always passes here, so we
    // verify the own-record path returns a (non-null) array. The "another user" guard
    // (returning null) is not reachable via the current schema and is left for a unit
    // test of UserFieldResolver.
    it('should return a non-null accounts array for the current user own record', async () => {
      const query = /* GraphQL */ `
        query OwnAccounts {
          currentUser {
            ... on CurrentUser {
              id
              accounts {
                id
              }
            }
          }
        }
      `;

      const res = await request.post('/graphql').send({ query }).expect(200);
      const user = res.body.data.currentUser;

      expect(user.id).toBe(currentUserId);
      expect(user.accounts).not.toBeNull();
      expect(Array.isArray(user.accounts)).toBe(true);
    });
  });

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
    `;

    const searchIds = async (keyword: string): Promise<string[]> => {
      const res = await request.post('/graphql').send({ query, variables: { keyword } }).expect(200);
      expect(res.body.data.searchUsers.__typename).toBe('SearchUsersOutput');
      return res.body.data.searchUsers.users.map((u: { id: string }) => u.id);
    };

    let eventId: string;

    beforeEach(async () => {
      ({ eventId } = await fixtures.insertEventWithCreator({ title: 'Noël', creatorId: currentUserId }));
    });

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const res = await anon
        .post('/graphql')
        .send({ query, variables: { keyword: 'someone' } })
        .expect(200);

      expect(res.body.data?.searchUsers?.__typename).not.toBe('SearchUsersOutput');
    });

    it('should return the matching users of the circle, never the current user', async () => {
      const { userId: friendId } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'zorglub@test.fr',
        firstname: 'Zorglub',
        lastname: 'Searchable',
        eventId,
      });

      expect(await searchIds('Zorglub')).toEqual([friendId]);
      expect(await searchIds('zorglub@test')).toEqual([friendId]);
      expect(await searchIds('test')).not.toContain(currentUserId);
    });

    it('should never return a user who attends no event with the current user', async () => {
      await fixtures.insertUser({ email: 'stranger@gmail.com', firstname: 'Zorglub', lastname: 'Stranger' });
      const { eventId: otherEventId } = await fixtures.insertEventWithCreator({
        title: 'Other',
        creatorId: await fixtures.insertUser({ email: 'other@gmail.com', firstname: 'Other', lastname: 'Creator' }),
      });
      await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'guest@gmail.com',
        firstname: 'Zorglub',
        lastname: 'Guest',
        eventId: otherEventId,
      });

      expect(await searchIds('Zorglub')).toEqual([]);
      expect(await searchIds('gmail')).toEqual([]);
      expect(await searchIds('stranger@gmail.com')).toEqual([]);
    });

    it.each(['__', '%%', '_%', '\\\\'])('should match the keyword %s literally, not as a wildcard', async keyword => {
      await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'friend@test.fr',
        firstname: 'Friend',
        lastname: 'Circle',
        eventId,
      });

      expect(await searchIds(keyword)).toEqual([]);
    });

    it('should not return a disabled user of the circle', async () => {
      const { userId: disabledId } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'disabled@test.fr',
        firstname: 'Zorglub',
        lastname: 'Disabled',
        eventId,
      });
      await runSql(`UPDATE "user" SET is_enabled = false WHERE id = '${disabledId}'`);

      expect(await searchIds('Zorglub')).toEqual([]);
    });

    it('should not expose the private fields of the users', async () => {
      const res = await request.post('/graphql').send({
        query: /* GraphQL */ `
            query SearchUsersPrivateFields {
              searchUsers(keyword: "zorglub") {
                ... on SearchUsersOutput {
                  users {
                    id
                    birthday
                  }
                }
              }
            }
          `,
      });

      expect(res.body.data?.searchUsers).toBeUndefined();
      expect(res.body.errors?.[0]?.message).toContain('Cannot query field "birthday" on type "User"');
    });

    it.each([
      { keyword: '', case: 'empty keyword' },
      { keyword: 'a', case: 'keyword too short' },
    ])('should return ValidationRejection when invalid input: $case', async ({ keyword }) => {
      const res = await request.post('/graphql').send({ query, variables: { keyword } }).expect(200);

      expect(res.body.data.searchUsers.__typename).toBe('ValidationRejection');
    });
  });

  describe('Query userByEmail', () => {
    const query = /* GraphQL */ `
      query UserByEmail($email: String!) {
        userByEmail(email: $email) {
          __typename
          ... on UserByEmailOutput {
            user {
              __typename
              id
              firstName
              lastName
              email
              pictureUrl
            }
          }
          ... on BusinessRuleRejection {
            code
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

    const lookup = async (email: string) => {
      const res = await request.post('/graphql').send({ query, variables: { email } }).expect(200);
      return res.body.data.userByEmail;
    };

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const res = await anon
        .post('/graphql')
        .send({ query, variables: { email: 'someone@test.fr' } })
        .expect(200);

      expect(res.body.data?.userByEmail?.__typename).not.toBe('UserByEmailOutput');
    });

    it('should return the public profile of the account owning the exact email', async () => {
      const userId = await fixtures.insertUser({ email: 'paul@test.fr', firstname: 'Paul', lastname: 'Martin' });

      expect(await lookup('Paul@Test.fr')).toEqual({
        __typename: 'UserByEmailOutput',
        user: {
          __typename: 'User',
          id: userId,
          firstName: 'Paul',
          lastName: 'Martin',
          email: 'paul@test.fr',
          pictureUrl: null,
        },
      });
    });

    it('should not match a part of an email', async () => {
      await fixtures.insertUser({ email: 'paul@test.fr', firstname: 'Paul', lastname: 'Martin' });

      expect(await lookup('aul@test.fr')).toEqual({ __typename: 'UserByEmailOutput', user: null });
    });

    it('should return no user for an unknown email, a disabled account or the current user', async () => {
      const disabledId = await fixtures.insertUser({ email: 'off@test.fr', firstname: 'Off', lastname: 'Line' });
      await runSql(`UPDATE "user" SET is_enabled = false WHERE id = '${disabledId}'`);

      expect(await lookup('nobody@test.fr')).toEqual({ __typename: 'UserByEmailOutput', user: null });
      expect(await lookup('off@test.fr')).toEqual({ __typename: 'UserByEmailOutput', user: null });
      expect(await lookup(Fixtures.BASE_USER_EMAIL)).toEqual({ __typename: 'UserByEmailOutput', user: null });
    });

    it('should return ValidationRejection when the email is invalid', async () => {
      expect((await lookup('not-an-email')).__typename).toBe('ValidationRejection');
    });

    it('should count every alias against the hourly quota and reject past 30 lookups', async () => {
      const aliases = Array.from(
        { length: 30 },
        (_, index) => `l${index}: userByEmail(email: "nobody${index}@test.fr") { __typename }`,
      ).join('\n');
      const batch = await request
        .post('/graphql')
        .send({ query: `query Batch { ${aliases} }` })
        .expect(200);

      expect(
        Object.values(batch.body.data).every(
          result => (result as { __typename: string }).__typename === 'UserByEmailOutput',
        ),
      ).toBe(true);
      expect(await lookup('one-more@test.fr')).toEqual({ __typename: 'BusinessRuleRejection', code: 'RATE_LIMITED' });
    });
  });

  describe('Mutation sendResetPasswordEmail', () => {
    const mutation = /* GraphQL */ `
      mutation SendResetPasswordEmail($input: SendResetPasswordEmailInput!) {
        sendResetPasswordEmail(input: $input) {
          __typename
          ... on BusinessRuleRejection {
            code
          }
        }
      }
    `;
    const resetEmailSubject = 'Reinitialiser le mot de passe';

    beforeEach(async () => {
      // Earlier tests may have sent emails without checking them: count only the ones of this test
      await clearMails();
    });

    const sendResetEmail = async (email: string, ip?: string) => {
      const anon = await getRequest();
      const call = anon.post('/graphql');
      if (ip) call.set('X-Forwarded-For', ip);
      const res = await call.send({ query: mutation, variables: { input: { email } } }).expect(200);
      return res.body.data.sendResetPasswordEmail;
    };

    it('should answer the same way for an unknown email, without email nor reset code', async () => {
      expect(await sendResetEmail('nobody@test.fr')).toEqual({ __typename: 'VoidOutput' });

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE).hasNumberOfRows(0);
      await expectMail().waitFor(500).hasNumberOfEmails(0);
    });

    it('should answer the same way for a known email, and email it a new reset code', async () => {
      expect(await sendResetEmail(Fixtures.BASE_USER_EMAIL)).toEqual({ __typename: 'VoidOutput' });

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .toMatchObject({ user_id: currentUserId, token: expect.stringMatching(/^[0-9a-z]{20}$/) });
      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(1)
        .hasSubject(resetEmailSubject)
        .hasReceivers([Fixtures.BASE_USER_EMAIL]);
    });

    it('should answer the same way when a reset code is still valid, and email that code again', async () => {
      await fixtures.insertUserPasswordVerification({
        userId: currentUserId,
        token: 'pendingtoken',
        expiredAt: DateTime.now().plus({ minutes: 10 }).toJSDate(),
      });

      expect(await sendResetEmail(Fixtures.BASE_USER_EMAIL)).toEqual({ __typename: 'VoidOutput' });

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .toMatchObject({ token: 'pendingtoken' });
      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(1)
        .hasSubject(resetEmailSubject)
        .hasReceivers([Fixtures.BASE_USER_EMAIL]);
    });

    it('should refuse the 4th request of the hour for one email, whether it has an account or not', async () => {
      for (const email of ['nobody@test.fr', Fixtures.BASE_USER_EMAIL]) {
        for (let attempt = 0; attempt < 3; attempt++) {
          expect(await sendResetEmail(email)).toEqual({ __typename: 'VoidOutput' });
        }
        expect(await sendResetEmail(email)).toEqual({ __typename: 'BusinessRuleRejection', code: 'RATE_LIMITED' });
      }

      await expectMail().waitFor(500).hasNumberOfEmails(3).hasReceivers([Fixtures.BASE_USER_EMAIL]);
    });

    it('should count the casing of an email on the same counter', async () => {
      await fillRateLimit(`resetPasswordEmail:email:${emailSubject('nobody@test.fr')}`, 3);

      expect(await sendResetEmail('NoBody@Test.fr')).toEqual({
        __typename: 'BusinessRuleRejection',
        code: 'RATE_LIMITED',
      });
    });

    it('should refuse a client address after 10 requests within the hour, on any email', async () => {
      await fillRateLimit('resetPasswordEmail:ip:203.0.113.9', 10);

      expect(await sendResetEmail('someone@test.fr', '203.0.113.9')).toEqual({
        __typename: 'BusinessRuleRejection',
        code: 'RATE_LIMITED',
      });
      expect(await sendResetEmail('someone@test.fr', '203.0.113.10')).toEqual({ __typename: 'VoidOutput' });
    });
  });

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
    `;

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const res = await anon.post('/graphql').send({ query, variables: {} }).expect(200);

      expect(res.body.data?.closestFriends?.__typename).not.toBe('ClosestFriendsOutput');
    });

    it('should return a ClosestFriendsOutput for an authenticated user', async () => {
      const res = await request.post('/graphql').send({ query, variables: {} }).expect(200);

      expect(res.body.data.closestFriends.__typename).toBe('ClosestFriendsOutput');
      expect(Array.isArray(res.body.data.closestFriends.users)).toBe(true);
    });

    it('should return ValidationRejection when limit exceeds the maximum', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { limit: 51 } })
        .expect(200);

      expect(res.body.data.closestFriends.__typename).toBe('ValidationRejection');
    });
  });
});
