import { uuid } from '@wishlist/common'
import * as request from 'supertest'

import 'jest-extended'

import { PasswordManager } from '../domain/auth'
import { insertUser, USER_TABLE, useTestApp } from './utils'

describe('AuthController', () => {
  const { getHttpServer, expectTable, getDatasource } = useTestApp()

  describe('POST /login', () => {
    it('should return 400 with invalid input', () => {
      return request(getHttpServer())
        .post('/auth/login')
        .send({ email: 'invalid-email', password: '' })
        .expect(400)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Bad Request' }))
    })

    it('should return 401 with not existing user', async () => {
      await expectTable(USER_TABLE).hasNumberOfRows(0).check()

      await request(getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.fr', password: 'password' })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return 401 with invalid credentials', async () => {
      const datasource = getDatasource()

      await insertUser(datasource, {
        id: uuid(),
        email: 'test@test.fr',
        firstname: 'John',
        lastname: 'Doe',
        password_enc: await PasswordManager.hash('password'),
      })

      await request(getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.fr', password: 'invalid-password' })
        .expect(401)
        .expect(({ body }) => expect(body).toMatchObject({ error: 'Unauthorized', message: 'Incorrect login' }))
    })

    it('should return tokens with valid credentials', async () => {
      const datasource = getDatasource()

      await insertUser(datasource, {
        id: uuid(),
        email: 'test@test.fr',
        firstname: 'John',
        lastname: 'Doe',
        password_enc: await PasswordManager.hash('password'),
      })

      await request(getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.fr', password: 'password' })
        .expect(200)
        .expect(({ body }) =>
          expect(body).toMatchObject({ access_token: expect.toBeString(), refresh_token: expect.toBeString() }),
        )
    })
  })
})
