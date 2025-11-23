import { PasswordManager } from '@wishlist/api/auth'
import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { DateTime } from 'luxon'

describe('UserPasswordVerificationController', () => {
  const { getRequest, expectTable, getFixtures, expectMail } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('POST /user/forgot-password/send-reset-email', () => {
    const path = '/user/forgot-password/send-reset-email'

    it('should fail with invalid email', async () => {
      const request = await getRequest()

      return request.post(path).send({ email: 'invalid-email' }).expect(400)
    })

    it('should fail with not existing email', async () => {
      await fixtures.insertBaseUser()

      const request = await getRequest()

      return request.post(path).send({ email: 'not-existing-mail@test.fr' }).expect(404)
    })

    it('should send reset email when valid input', async () => {
      const userId = await fixtures.insertBaseUser()

      const request = await getRequest()

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE).hasNumberOfRows(0)
      await request.post(path).send({ email: Fixtures.BASE_USER_EMAIL }).expect(201)

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .toEqual({
          id: expect.toBeString(),
          token: expect.toBeString(),
          user_id: userId,
          expired_at: expect.toBeAfter(new Date()),
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })

      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(1)
        .mail(0)
        .hasSubject('[Wishlist] Reinitialiser le mot de passe')
        .hasSender('contact@wishlistapp.fr')
        .hasReceiver(Fixtures.BASE_USER_EMAIL)
    })

    it('should fail when there is still a valid reset attempt', async () => {
      const userId = await fixtures.insertBaseUser()
      await fixtures.insertUserPasswordVerification({
        userId,
        token: 'token',
        expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
      })

      const request = await getRequest()

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE).hasNumberOfRows(1)
      await request.post(path).send({ email: Fixtures.BASE_USER_EMAIL }).expect(401)

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE).hasNumberOfRows(1)
      await expectMail().waitFor(500).hasNumberOfEmails(0)
    })
  })

  describe('POST /user/forgot-password/reset', () => {
    const path = '/user/forgot-password/reset'

    it('should fail with empty input', async () => {
      const request = await getRequest()

      return request
        .post(path)
        .send({})
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: [
              'email should not be empty',
              'token should not be empty',
              'new_password must be shorter than or equal to 50 characters',
            ],
          }),
        )
    })

    it('should fail with invalid input', async () => {
      const request = await getRequest()

      return request
        .post(path)
        .send({ email: 'invalid-email', token: 1234, new_password: '2small' })
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: [
              'email must be an email',
              'token must be a string',
              'new_password must be longer than or equal to 8 characters',
            ],
          }),
        )
    })

    it('should fail with no reset token in database for user', async () => {
      await fixtures.insertBaseUser()

      const request = await getRequest()

      return request
        .post(path)
        .send({ email: Fixtures.BASE_USER_EMAIL, token: 'reset-token', new_password: 'NewPassword123' })
        .expect(401)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: 'This reset code is not valid',
          }),
        )
    })

    it('should fail with invalid token', async () => {
      const userId = await fixtures.insertBaseUser()
      await fixtures.insertUserPasswordVerification({
        userId,
        token: 'reset-token',
        expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
      })

      const request = await getRequest()

      return request
        .post(path)
        .send({ email: Fixtures.BASE_USER_EMAIL, token: 'wrong-token', new_password: 'NewPassword123' })
        .expect(401)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: 'This reset code is not valid',
          }),
        )
    })

    it('should fail with expired token', async () => {
      const userId = await fixtures.insertBaseUser()
      await fixtures.insertUserPasswordVerification({
        userId,
        token: 'reset-token',
        expiredAt: DateTime.now().minus({ hour: 1 }).toJSDate(),
      })

      const request = await getRequest()

      return request
        .post(path)
        .send({ email: Fixtures.BASE_USER_EMAIL, token: 'reset-token', new_password: 'NewPassword123' })
        .expect(401)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: 'This reset code is expired',
          }),
        )
    })

    it('should reset the password with valid input', async () => {
      const userId = await fixtures.insertBaseUser()
      await fixtures.insertUserPasswordVerification({
        userId,
        token: 'reset-token',
        expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
      })

      const request = await getRequest()

      const newPassword = 'NewPassword123'

      await request
        .post(path)
        .send({ email: Fixtures.BASE_USER_EMAIL, token: 'reset-token', new_password: newPassword })
        .expect(201)

      await expectTable(Fixtures.USER_TABLE)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const res = await PasswordManager.verify({ hash: value, plainPassword: newPassword })
          expect(res, 'Password should match').toBe(true)
        })

      await expectTable(Fixtures.USER_PASSWORD_VERIFICATION_TABLE).hasNumberOfRows(0)
    })
  })
})
