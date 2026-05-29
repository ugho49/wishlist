import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'

describe('AuthResolver (GraphQL)', () => {
  const { getRequest, getFixtures } = useTestApp()
  let fixtures: Fixtures
  let request: RequestApp

  beforeEach(async () => {
    fixtures = getFixtures()
    // Auth mutations are public, so we use an unauthenticated request
    request = await getRequest()
  })

  describe('mutation login', () => {
    const query = /* GraphQL */ `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          __typename
          ... on LoginOutput {
            accessToken
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

    it('should login successfully and return an access token (happy path)', async () => {
      const email = 'login-happy@test.fr'
      const password = 'SuperSecret123'

      await fixtures.insertUser({
        email,
        firstname: 'Happy',
        lastname: 'Path',
        password,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email, password } } })
        .expect(200)

      expect(res.body.errors).toBeUndefined()
      expect(res.body.data.login).toMatchObject({
        __typename: 'LoginOutput',
        accessToken: expect.toBeString(),
      })
      expect(res.body.data.login.accessToken.length).toBeGreaterThan(0)
    })

    it('should be case insensitive on email', async () => {
      const password = 'SuperSecret123'

      await fixtures.insertUser({
        email: 'casing@test.fr',
        firstname: 'Case',
        lastname: 'Insensitive',
        password,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email: 'CaSiNg@TEST.fr', password } } })
        .expect(200)

      expect(res.body.data.login).toMatchObject({
        __typename: 'LoginOutput',
        accessToken: expect.toBeString(),
      })
    })

    it('should reject with UnauthorizedRejection when the user is unknown', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email: 'unknown@test.fr', password: 'whatever' } } })
        .expect(200)

      expect(res.body.data.login).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      })
    })

    it('should reject with UnauthorizedRejection when the password is wrong', async () => {
      const email = 'wrong-password@test.fr'

      await fixtures.insertUser({
        email,
        firstname: 'Wrong',
        lastname: 'Password',
        password: 'GoodPassword123',
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { email, password: 'BadPassword123' } } })
        .expect(200)

      expect(res.body.data.login).toMatchObject({
        __typename: 'UnauthorizedRejection',
        message: 'Incorrect login',
      })
    })

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
      const res = await request.post('/graphql').send({ query, variables: { input } }).expect(200)

      expect(res.body.data.login).toMatchObject({
        __typename: 'ValidationRejection',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field,
            message: expect.toBeString(),
          }),
        ]),
      })
    })

    it('should not succeed when a required field is missing from the input', async () => {
      // password is missing -> GraphQL variable coercion (non-nullable) fails before the resolver,
      // so the request is rejected at the HTTP layer (400) with top-level errors and no data.
      const res = await request.post('/graphql').send({ query, variables: { input: { email: 'someone@test.fr' } } })

      expect(res.status).toBe(400)
      expect(res.body.errors).toBeDefined()
      expect(res.body.data?.login?.__typename).not.toBe('LoginOutput')
    })
  })

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
    `

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
      const res = await request.post('/graphql').send({ query, variables: { input } })

      expect(res.status).toBe(400)
      expect(res.body.errors).toBeDefined()
      expect(res.body.data?.loginWithGoogle?.__typename).not.toBe('LoginWithGoogleOutput')
    })

    it('should not succeed when a required field is missing', async () => {
      // createUserIfNotExists is missing -> non-nullable variable coercion fails before the resolver,
      // so the request is rejected at the HTTP layer (400) with top-level errors and no data.
      const res = await request.post('/graphql').send({ query, variables: { input: { code: 'some-code' } } })

      expect(res.status).toBe(400)
      expect(res.body.errors).toBeDefined()
      expect(res.body.data?.loginWithGoogle?.__typename).not.toBe('LoginWithGoogleOutput')
    })

    it('should reject with an error rejection when the Google code is invalid (no real Google call succeeds)', async () => {
      // The input is present and correctly typed, so it reaches the resolver (HTTP 200).
      // An obviously invalid code cannot be verified by Google -> the use-case throws,
      // which the error-transform plugin turns into a rejection union member.
      // We assert it does NOT succeed.
      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { code: 'definitely-invalid-google-code', createUserIfNotExists: false } } })
        .expect(200)

      expect(res.body.data.loginWithGoogle.__typename).not.toBe('LoginWithGoogleOutput')
      expect(res.body.data.loginWithGoogle.__typename).toEqual(expect.toBeString())
    })
  })
})
