import { BASE_USER_EMAIL, DEFAULT_USER_PASSWORD, insertBaseUser, RequestApp, USER_TABLE, useTestApp } from './utils'

describe('AuthController', () => {
  const { getRequest, expectTable, getDatasource } = useTestApp()
  let request: RequestApp

  beforeEach(async () => {
    request = await getRequest()
  })

  describe('POST /login', () => {
    it('should return 400 with invalid input', async () => {
      await request
        .post('/auth/login')
        .send({ email: 'invalid-email', password: '' })
        .expect(400)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Bad Request' }))
    })

    it('should return 401 with not existing user', async () => {
      await expectTable(USER_TABLE).hasNumberOfRows(0).check()

      await request
        .post('/auth/login')
        .send({ email: BASE_USER_EMAIL, password: DEFAULT_USER_PASSWORD })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return 401 with invalid credentials', async () => {
      await insertBaseUser(getDatasource())

      await request
        .post('/auth/login')
        .send({ email: BASE_USER_EMAIL, password: 'invalid-password' })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return tokens with valid credentials', async () => {
      await insertBaseUser(getDatasource())

      await request
        .post('/auth/login')
        .send({ email: BASE_USER_EMAIL, password: DEFAULT_USER_PASSWORD })
        .expect(200)
        .expect(({ body }) =>
          expect(body).toMatchObject({ access_token: expect.toBeString(), refresh_token: expect.toBeString() }),
        )
    })
  })
})
