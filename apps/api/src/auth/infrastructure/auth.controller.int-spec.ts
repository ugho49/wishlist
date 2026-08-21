import type { RequestApp } from '@wishlist/api-test-utils'

import { BASE_USER_EMAIL, DEFAULT_USER_PASSWORD, Factories, Tables, useTestApp } from '@wishlist/api-test-utils'

describe('AuthController', () => {
  const { getRequest, expectTable, getFactories } = useTestApp()
  let request: RequestApp
  let factories: Factories

  beforeEach(async () => {
    request = await getRequest()
    factories = getFactories()
  })

  describe('POST /auth/login', () => {
    const path = '/auth/login'

    it('should return 400 with invalid input', async () => {
      await request
        .post(path)
        .send({ email: 'invalid-email', password: '' })
        .expect(400)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Bad Request' }))
    })

    it('should return 401 with not existing user', async () => {
      await expectTable(Tables.USER).hasNumberOfRows(0)

      await request
        .post(path)
        .send({ email: BASE_USER_EMAIL, password: DEFAULT_USER_PASSWORD })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return 401 with invalid credentials', async () => {
      await factories.user.createBase()

      await request
        .post(path)
        .send({ email: BASE_USER_EMAIL, password: 'invalid-password' })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return tokens with valid credentials', async () => {
      await factories.user.createBase()

      await request
        .post(path)
        .send({ email: BASE_USER_EMAIL, password: DEFAULT_USER_PASSWORD })
        .expect(200)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            access_token: expect.toBeString(),
          }),
        )
    })
  })
})
