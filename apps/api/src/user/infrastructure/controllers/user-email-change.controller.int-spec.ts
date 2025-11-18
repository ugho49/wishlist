import { Fixtures, useTestApp, useTestMail } from '@wishlist/api-test-utils'
import { DateTime } from 'luxon'

describe('UserEmailChangeController', () => {
  const { getRequest, expectTable, getFixtures } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('GET /user/email-change/pending', () => {
    const path = '/user/email-change/pending'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      await request.get(path).expect(401)
    })

    describe('when user is authenticated', () => {
      it('should return undefined when no pending email change', async () => {
        const request = await getRequest({ signedAs: 'BASE_USER' })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({})
          })
      })

      it('should return pending email change when exists and not expired', async () => {
        const userId = await fixtures.insertBaseUser()
        const newEmail = 'newemail@test.fr'
        const expiredAt = DateTime.now().plus({ hour: 1 }).toJSDate()

        await fixtures.insertUserEmailChangeVerification({
          userId,
          newEmail,
          token: 'test-token',
          expiredAt,
        })

        const request = await getRequest({ signedAs: 'BASE_USER' })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({
              new_email: newEmail,
              expired_at: expiredAt.toISOString(),
            })
          })
      })

      it('should return undefined when pending email change is expired', async () => {
        const userId = await fixtures.insertBaseUser()

        await fixtures.insertUserEmailChangeVerification({
          userId,
          newEmail: 'newemail@test.fr',
          token: 'test-token',
          expiredAt: DateTime.now().minus({ hour: 1 }).toJSDate(),
        })

        const request = await getRequest({ signedAs: 'BASE_USER' })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({})
          })
      })
    })
  })

  describe('POST /user/email-change/request', () => {
    const { expectMail } = useTestMail()
    const path = '/user/email-change/request'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      await request.post(path).send({ new_email: 'newemail@test.fr' }).expect(401)
    })

    describe('when user is authenticated', () => {
      it.each([
        {
          body: {},
          case: 'empty body',
          message: [
            'new_email should not be empty',
            'new_email must be a string',
            'new_email must be an email',
            'new_email must be shorter than or equal to 200 characters',
          ],
        },
        {
          body: { new_email: 'invalid-email' },
          case: 'invalid email',
          message: ['new_email must be an email'],
        },
        {
          body: { new_email: 123 },
          case: 'non-string email',
          message: [
            'new_email must be shorter than or equal to 200 characters',
            'new_email must be an email',
            'new_email must be a string',
          ],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
        const request = await getRequest({ signedAs: 'BASE_USER' })

        await request
          .post(path)
          .send(body)
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: expect.arrayContaining(message),
            }),
          )
      })

      it('should fail when new email is the same as current email', async () => {
        await fixtures.insertBaseUser()
        const request = await getRequest({ signedAs: 'BASE_USER' })

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(0)

        await request
          .post(path)
          .send({ new_email: Fixtures.BASE_USER_EMAIL })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              message: 'New email cannot be the same as current email',
            }),
          )

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(0)
        await expectMail().waitFor(500).hasNumberOfEmails(0)
      })

      it('should fail when new email is already taken by another user', async () => {
        await fixtures.insertBaseUser()
        await fixtures.insertUser({
          email: 'existing@test.fr',
          firstname: 'Existing',
          lastname: 'User',
        })

        const request = await getRequest({ signedAs: 'BASE_USER' })

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(0)

        await request
          .post(path)
          .send({ new_email: 'existing@test.fr' })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              message: 'This email is already in use',
            }),
          )

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(0)
        await expectMail().waitFor(500).hasNumberOfEmails(0)
      })

      it('should fail when there is already a pending email change request', async () => {
        const userId = await fixtures.insertBaseUser()
        await fixtures.insertUserEmailChangeVerification({
          userId,
          newEmail: 'pending@test.fr',
          token: 'token',
          expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
        })

        const request = await getRequest({ signedAs: 'BASE_USER' })

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(1)

        await request
          .post(path)
          .send({ new_email: 'newemail@test.fr' })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              message: 'An email change request is already pending, please retry later',
            }),
          )

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(1)
        await expectMail().waitFor(500).hasNumberOfEmails(0)
      })

      it('should create email change verification when valid input', async () => {
        const userId = await fixtures.insertBaseUser()
        const newEmail = 'newemail@test.fr'

        const request = await getRequest({ signedAs: 'BASE_USER' })

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(0)

        await request.post(path).send({ new_email: newEmail }).expect(201)

        await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toEqual({
            id: expect.toBeString(),
            user_id: userId,
            new_email: newEmail,
            token: expect.toBeString(),
            expired_at: expect.toBeAfter(new Date()),
            created_at: expect.toBeDate(),
            updated_at: expect.toBeDate(),
          })

        // Should send 2 emails: one to new email, one to old email
        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(2)
          .mail(0)
          .hasSubject("[Wishlist] Confirmez votre changement d'adresse email")
          .hasSender('contact@wishlistapp.fr')
          .hasReceiver(newEmail)

        await expectMail()
          .mail(1)
          .hasSubject("[Wishlist] Demande de changement d'adresse email")
          .hasSender('contact@wishlistapp.fr')
          .hasReceiver(Fixtures.BASE_USER_EMAIL)
      })
    })
  })

  describe('POST /user/email-change/confirm', () => {
    const { expectMail } = useTestMail()
    const path = '/user/email-change/confirm'

    it.each([
      {
        body: {},
        case: 'empty body',
        message: [
          'new_email should not be empty',
          'new_email must be a string',
          'new_email must be an email',
          'token should not be empty',
          'token must be a string',
        ],
      },
      {
        body: { new_email: 'invalid-email', token: 123 },
        case: 'invalid types',
        message: ['new_email must be an email', 'token must be a string'],
      },
    ])('should return 400 when invalid input: $case', async ({ body, message }) => {
      const request = await getRequest()

      await request
        .post(path)
        .send(body)
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining(message),
          }),
        )
    })

    it('should fail when no verification found for email and token', async () => {
      await fixtures.insertBaseUser()

      const request = await getRequest()

      await request
        .post(path)
        .send({ new_email: 'newemail@test.fr', token: 'invalid-token' })
        .expect(401)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: 'This email change verification is not valid',
          }),
        )
    })

    it('should fail when verification is expired', async () => {
      const userId = await fixtures.insertBaseUser()
      const newEmail = 'newemail@test.fr'
      const token = 'test-token'

      await fixtures.insertUserEmailChangeVerification({
        userId,
        newEmail,
        token,
        expiredAt: DateTime.now().minus({ hour: 1 }).toJSDate(),
      })

      const request = await getRequest()

      await request
        .post(path)
        .send({ new_email: newEmail, token })
        .expect(401)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: 'This email change verification has expired',
          }),
        )

      // Verification should not be deleted
      await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(1)
      // User email should not be changed
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        email: Fixtures.BASE_USER_EMAIL,
      })
    })

    it('should fail when new email is already taken by another user', async () => {
      const userId = await fixtures.insertBaseUser()
      await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })
      const newEmail = 'other@test.fr'
      const token = 'test-token'

      await fixtures.insertUserEmailChangeVerification({
        userId,
        newEmail,
        token,
        expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
      })

      const request = await getRequest()

      await request
        .post(path)
        .send({ new_email: newEmail, token })
        .expect(401)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            message: 'This email is already in use by another user',
          }),
        )

      // Verification should not be deleted
      await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(1)
      // User email should not be changed
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        email: Fixtures.BASE_USER_EMAIL,
      })
    })

    it('should change email with valid input', async () => {
      const userId = await fixtures.insertBaseUser()
      const newEmail = 'newemail@test.fr'
      const token = 'test-token'

      await fixtures.insertUserEmailChangeVerification({
        userId,
        newEmail,
        token,
        expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
      })

      const request = await getRequest()

      await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(1)

      await request.post(path).send({ new_email: newEmail, token }).expect(201)

      // Verification should be deleted
      await expectTable(Fixtures.USER_EMAIL_CHANGE_VERIFICATION_TABLE).hasNumberOfRows(0)

      // User email should be updated
      await expectTable(Fixtures.USER_TABLE).row(0).toMatchObject({
        id: userId,
        email: newEmail,
      })

      // Should send 2 emails: one to old email, one to new email
      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(2)
        .mail(0)
        .hasSubject('[Wishlist] Votre adresse email a été modifiée')
        .hasSender('contact@wishlistapp.fr')
        .hasReceiver(Fixtures.BASE_USER_EMAIL)

      await expectMail()
        .mail(1)
        .hasSubject('[Wishlist] Votre adresse email a été mise à jour')
        .hasSender('contact@wishlistapp.fr')
        .hasReceiver(newEmail)
    })
  })
})
