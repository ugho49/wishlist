import * as request from 'supertest'

import 'jest-extended'

import { useTestApp } from '../../../__test__'

const USER_TABLE = '"user"'
const USER_EMAIL_SETTING_TABLE = 'user_email_setting'

describe('UserController', () => {
  const { getHttpServer, expectTable } = useTestApp()

  describe('POST /user/register', () => {
    const path = '/user/register'

    it.each([
      {
        body: {},
        case: 'empty body',
        message: [
          'firstname must be shorter than or equal to 50 characters',
          'lastname must be shorter than or equal to 50 characters',
          'email must be shorter than or equal to 200 characters',
          'password must be shorter than or equal to 50 characters',
        ],
      },
      {
        body: { email: 'not-an-email' },
        case: 'invalid email',
        message: ['email must be an email'],
      },
      // TODO: add more cases
    ])('should return 400 when invalid input: $case', async ({ body, message }) => {
      await request(getHttpServer())
        .post(path)
        .send(body)
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
        )

      await expectTable(USER_TABLE).hasNumberOfRows(0).check()
    })

    describe('when valid input', () => {
      // TODO: CASE - it should fail when email already exists

      // TODO: CASE - it should join event when email invited as pending

      it('should return 201 when valid input and create user', async () => {
        await expectTable(USER_TABLE).hasNumberOfRows(0).check()

        await request(getHttpServer())
          .post(path)
          .send({ email: 'test@test.fr', password: 'Password123', firstname: 'John', lastname: 'Doe' })
          .expect(201)
          .expect(({ body }) =>
            expect(body).toEqual({
              id: expect.toBeString(),
              email: 'test@test.fr',
              firstname: 'John',
              lastname: 'Doe',
            }),
          )

        await expectTable(USER_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: expect.toBeString(),
            email: 'test@test.fr',
            first_name: 'John',
            last_name: 'Doe',
            authorities: ['ROLE_USER'],
            is_enabled: true,
            password_enc: expect.any(String),
            picture_url: null,
            last_connected_at: expect.toBeDateString(),
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          })
          .check()

        await expectTable(USER_EMAIL_SETTING_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: expect.toBeString(),
            // TODO: check id is the same as user id from response of http call
          })
          .check()

        // TODO: assert WelcomeEmail Sent
      })
    })
  })
})
