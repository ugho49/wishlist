import * as request from 'supertest'

import { useTestApp } from '../../__test__'

describe('AuthController', () => {
  const { getHttpServer } = useTestApp()

  describe('POST /login', () => {
    it('should return 400 with invalid input', () => {
      return request(getHttpServer())
        .post('/auth/login')
        .send({ email: 'invalid-email', password: '' })
        .expect(400)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Bad Request' }))
    })

    it('should return 401 with not existing user', () => {
      return request(getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.fr', password: 'password' })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized' }))
    })

    it('should return 401 with invalid credentials', () => {
      // TODO: create a user with datasource
      return request(getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.fr', password: 'invalid-password' })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized' }))
    })
  })
})
