import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'

describe('AuthController', () => {
  const { getRequest, expectTable, getFixtures } = useTestApp()
  let request: RequestApp
  let fixtures: Fixtures

  beforeEach(async () => {
    request = await getRequest()
    fixtures = getFixtures()
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
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(0)

      await request
        .post(path)
        .send({ email: Fixtures.BASE_USER_EMAIL, password: Fixtures.DEFAULT_USER_PASSWORD })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return 401 with invalid credentials', async () => {
      await fixtures.insertBaseUser()

      await request
        .post(path)
        .send({ email: Fixtures.BASE_USER_EMAIL, password: 'invalid-password' })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return tokens with valid credentials', async () => {
      await fixtures.insertBaseUser()

      await request
        .post(path)
        .send({ email: Fixtures.BASE_USER_EMAIL, password: Fixtures.DEFAULT_USER_PASSWORD })
        .expect(200)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            access_token: expect.toBeString(),
            refresh_token: expect.toBeString(),
          }),
        )
    })
  })

  // TODO POST /auth/refresh
})
