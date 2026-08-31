import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { DateTime } from 'luxon';

import { RefreshTokenManager } from './util/refresh-token';

describe('AuthResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp();
  let fixtures: Fixtures;
  let request: RequestApp;

  beforeEach(async () => {
    fixtures = getFixtures();
    // Auth mutations are public, so we use an unauthenticated request
    request = await getRequest();
  });

  describe('mutation login', () => {
    const query = /* GraphQL */ `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          __typename
          ... on LoginOutput {
            accessToken
            refreshToken
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

    it('should login successfully and return an access token (happy path)', async () => {
      const email = 'login-happy@test.fr';
      const password = 'SuperSecret123';

      const userId = await fixtures.insertUser({
        email,
        firstname: 'Happy',
        lastname: 'Path',
        password,
      });

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email, password } } })
        .expect(200);

      expect(res.body.errors).toBeUndefined();
      const accessToken = res.body.data.login.accessToken;
      const refreshToken = res.body.data.login.refreshToken;
      expect(res.body.data.login.__typename).toBe('LoginOutput');
      expect(accessToken).toBeString();
      expect(accessToken.length).toBeGreaterThan(0);
      expect(refreshToken).toBeString();
      expect(refreshToken.length).toBeGreaterThan(0);

      await expectTable(Fixtures.USER_REFRESH_TOKEN_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        user_id: userId,
        revoked_at: null,
        token_hash: expect.toBeString(),
      });
    });

    it('should be case insensitive on email', async () => {
      const password = 'SuperSecret123';

      await fixtures.insertUser({
        email: 'casing@test.fr',
        firstname: 'Case',
        lastname: 'Insensitive',
        password,
      });

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email: 'CaSiNg@TEST.fr', password } } })
        .expect(200);

      expect(res.body.data.login).toMatchObject({
        __typename: 'LoginOutput',
        accessToken: expect.toBeString(),
      });
    });

    it('should reject with UnauthorizedRejection when the user is unknown', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email: 'unknown@test.fr', password: 'whatever' } } })
        .expect(200);

      expect(res.body.data.login).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      });
    });

    it('should reject with UnauthorizedRejection when the password is wrong', async () => {
      const email = 'wrong-password@test.fr';

      await fixtures.insertUser({
        email,
        firstname: 'Wrong',
        lastname: 'Password',
        password: 'GoodPassword123',
      });

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email, password: 'BadPassword123' } } })
        .expect(200);

      expect(res.body.data.login).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      });
    });

    it.each([
      {
        case: 'invalid email format',
        input: { email: 'not-an-email', password: 'somePassword' },
        field: 'email',
      },
      {
        case: 'missing email value (empty string)',
        input: { email: '', password: 'somePassword' },
        field: 'email',
      },
    ])('should return a ValidationRejection when input is invalid: $case', async ({ input, field }) => {
      const res = await request.post('/graphql').send({ query, variables: { input } }).expect(200);

      expect(res.body.data.login).toMatchObject({
        __typename: 'ValidationRejection',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field,
            message: expect.toBeString(),
          }),
        ]),
      });
    });

    it('should not succeed when a required field is missing from the input', async () => {
      // password is missing -> GraphQL variable coercion (non-nullable) fails before the resolver,
      // so the request is rejected at the HTTP layer (400) with top-level errors and no data.
      const res = await request.post('/graphql').send({ query, variables: { input: { email: 'someone@test.fr' } } });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.data?.login?.__typename).not.toBe('LoginOutput');
    });
  });

  describe('mutation loginWithGoogle', () => {
    const query = /* GraphQL */ `
      mutation LoginWithGoogle($input: LoginWithGoogleInput!) {
        loginWithGoogle(input: $input) {
          __typename
          ... on LoginWithGoogleOutput {
            accessToken
            newUserCreated
            linkedToExistingUser
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
          ... on InternalErrorRejection {
            message
          }
        }
      }
    `;

    it.each([
      {
        case: 'code is not a string',
        input: { code: 123, createUserIfNotExists: true },
      },
      {
        case: 'createUserIfNotExists is not a boolean',
        input: { code: 'some-code', createUserIfNotExists: 'yes' },
      },
    ])('should not succeed when input is invalid: $case', async ({ input }) => {
      // Wrong scalar types are caught during GraphQL variable coercion, before the resolver runs,
      // so the request is rejected at the HTTP layer (400) with top-level errors and no data.
      const res = await request.post('/graphql').send({ query, variables: { input } });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.data?.loginWithGoogle?.__typename).not.toBe('LoginWithGoogleOutput');
    });

    it('should not succeed when a required field is missing', async () => {
      // createUserIfNotExists is missing -> non-nullable variable coercion fails before the resolver,
      // so the request is rejected at the HTTP layer (400) with top-level errors and no data.
      const res = await request.post('/graphql').send({ query, variables: { input: { code: 'some-code' } } });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.data?.loginWithGoogle?.__typename).not.toBe('LoginWithGoogleOutput');
    });

    it('should reject with an error rejection when the Google code is invalid (no real Google call succeeds)', async () => {
      // The input is present and correctly typed, so it reaches the resolver (HTTP 200).
      // An obviously invalid code cannot be verified by Google -> the use-case throws,
      // which the error-transform plugin turns into a rejection union member.
      // We assert it does NOT succeed.
      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { code: 'definitely-invalid-google-code', createUserIfNotExists: false } } })
        .expect(200);

      expect(res.body.data.loginWithGoogle.__typename).not.toBe('LoginWithGoogleOutput');
      expect(res.body.data.loginWithGoogle.__typename).toEqual(expect.toBeString());
    });
  });

  describe('mutation refreshSession', () => {
    const refreshMutation = /* GraphQL */ `
      mutation RefreshSession($input: RefreshSessionInput!) {
        refreshSession(input: $input) {
          __typename
          ... on LoginOutput {
            accessToken
            refreshToken
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    const loginMutation = /* GraphQL */ `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          __typename
          ... on LoginOutput {
            accessToken
            refreshToken
          }
        }
      }
    `;

    it('should reject an unknown refresh token', async () => {
      const res = await request
        .post('/graphql')
        .send({ query: refreshMutation, variables: { input: { refreshToken: 'unknown-token' } } })
        .expect(200);

      expect(res.body.data.refreshSession).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      });
    });

    it('should return a new access token for a valid refresh token', async () => {
      const email = 'refresh-happy@test.fr';
      const password = 'SuperSecret123';
      await fixtures.insertUser({ email, firstname: 'Refresh', lastname: 'User', password });

      const loginRes = await request
        .post('/graphql')
        .send({ query: loginMutation, variables: { input: { email, password } } })
        .expect(200);

      const refreshToken = loginRes.body.data.login.refreshToken as string;

      const res = await request
        .post('/graphql')
        .send({ query: refreshMutation, variables: { input: { refreshToken } } })
        .expect(200);

      expect(res.body.data.refreshSession).toMatchObject({
        __typename: 'LoginOutput',
        accessToken: expect.toBeString(),
        refreshToken: expect.toBeString(),
      });
      expect(res.body.data.refreshSession.refreshToken).not.toBe(refreshToken);
      await expectTable(Fixtures.USER_REFRESH_TOKEN_TABLE).hasNumberOfRows(1);

      const reused = await request
        .post('/graphql')
        .send({ query: refreshMutation, variables: { input: { refreshToken } } })
        .expect(200);

      expect(reused.body.data.refreshSession).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      });
    });

    it('should reject an expired refresh token', async () => {
      const email = 'refresh-expired@test.fr';
      const password = 'SuperSecret123';
      const userId = await fixtures.insertUser({ email, firstname: 'Expired', lastname: 'User', password });
      const refreshToken = 'expired-refresh-token';

      await fixtures.insertUserRefreshToken({
        userId,
        tokenHash: RefreshTokenManager.hash(refreshToken),
        expiresAt: DateTime.now().minus({ days: 1 }).toJSDate(),
      });

      const res = await request
        .post('/graphql')
        .send({ query: refreshMutation, variables: { input: { refreshToken } } })
        .expect(200);

      expect(res.body.data.refreshSession).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      });
    });

    it('should reject a revoked refresh token', async () => {
      const email = 'refresh-revoked@test.fr';
      const password = 'SuperSecret123';
      await fixtures.insertUser({ email, firstname: 'Revoked', lastname: 'User', password });

      const loginRes = await request
        .post('/graphql')
        .send({ query: loginMutation, variables: { input: { email, password } } })
        .expect(200);

      const refreshToken = loginRes.body.data.login.refreshToken as string;

      await request
        .post('/graphql')
        .send({
          query: /* GraphQL */ `
            mutation Logout($input: LogoutInput!) {
              logout(input: $input) {
                __typename
              }
            }
          `,
          variables: { input: { refreshToken } },
        })
        .expect(200);

      const res = await request
        .post('/graphql')
        .send({ query: refreshMutation, variables: { input: { refreshToken } } })
        .expect(200);

      expect(res.body.data.refreshSession).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      });
    });
  });

  describe('mutation logout', () => {
    const logoutMutation = /* GraphQL */ `
      mutation Logout($input: LogoutInput!) {
        logout(input: $input) {
          __typename
          ... on VoidOutput {
            success
          }
        }
      }
    `;

    const loginMutation = /* GraphQL */ `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          __typename
          ... on LoginOutput {
            refreshToken
          }
        }
      }
    `;

    it('should revoke the session', async () => {
      const email = 'logout-happy@test.fr';
      const password = 'SuperSecret123';
      await fixtures.insertUser({ email, firstname: 'Logout', lastname: 'User', password });

      const loginRes = await request
        .post('/graphql')
        .send({ query: loginMutation, variables: { input: { email, password } } })
        .expect(200);

      const refreshToken = loginRes.body.data.login.refreshToken as string;

      const res = await request
        .post('/graphql')
        .send({ query: logoutMutation, variables: { input: { refreshToken } } })
        .expect(200);

      expect(res.body.data.logout).toMatchObject({ __typename: 'VoidOutput', success: true });
      await expectTable(Fixtures.USER_REFRESH_TOKEN_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        revoked_at: expect.toBeDate(),
      });
    });
  });
});
