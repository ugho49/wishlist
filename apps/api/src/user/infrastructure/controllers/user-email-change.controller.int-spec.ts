import type { RequestApp } from '@wishlist/api-test-utils'

import { BASE_USER_EMAIL, Factories, Tables, useTestApp } from '@wishlist/api-test-utils'
import { DateTime } from 'luxon'

describe('UserEmailChangeController', () => {
  const { getRequest, expectTable, getFactories, expectMail } = useTestApp()
  let factories: Factories

  beforeEach(() => {
    factories = getFactories()
  })

  describe('GET /user/email-change/pending', () => {
    const path = '/user/email-change/pending'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      await request.get(path).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await factories.getSignedUserId('BASE_USER')
      })

      it('should return undefined when no pending email change', async () => {
        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual({})
          })
      })

      it('should return pending email change when exists and not expired', async () => {
        const newEmail = 'newemail@test.fr'
        const expiredAt = DateTime.now().plus({ hour: 1 }).toJSDate()

        await factories.userEmailChangeVerification.create({
          userId: currentUserId,
          newEmail,
          token: 'test-token',
          expiredAt,
        })

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
        await factories.userEmailChangeVerification.create({
          userId: currentUserId,
          newEmail: 'newemail@test.fr',
          token: 'test-token',
          expiredAt: DateTime.now().minus({ hour: 1 }).toJSDate(),
        })

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
    const path = '/user/email-change/request'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()
      await request.post(path).send({ new_email: 'newemail@test.fr' }).expect(401)
    })

    describe('when user is authenticated', () => {
      let request: RequestApp
      let currentUserId: string

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' })
        currentUserId = await factories.getSignedUserId('BASE_USER')
      })

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['new_email should not be empty'],
        },
        {
          body: { new_email: 'invalid-email' },
          case: 'invalid email',
          message: ['new_email must be an email'],
        },
        {
          body: { new_email: `${'a'.repeat(200)}@test.com` },
          case: 'email too long',
          message: ['new_email must be shorter than or equal to 200 characters'],
        },
        {
          body: { new_email: 123 },
          case: 'non-string email',
          message: ['new_email must be a string'],
        },
      ])('should return 400 when invalid input: $case', async ({ body, message }) => {
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
        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(0)

        await request
          .post(path)
          .send({ new_email: BASE_USER_EMAIL })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              message: 'New email cannot be the same as current email',
            }),
          )

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(0)
        await expectMail().waitFor(500).hasNumberOfEmails(0)
      })

      it('should fail when new email is already taken by another user', async () => {
        await factories.user.create({
          email: 'existing@test.fr',
          firstName: 'Existing',
          lastName: 'User',
        })

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(0)

        await request
          .post(path)
          .send({ new_email: 'existing@test.fr' })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              message: 'This email is already in use',
            }),
          )

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(0)
        await expectMail().waitFor(500).hasNumberOfEmails(0)
      })

      it('should fail when there is already a pending email change request', async () => {
        await factories.userEmailChangeVerification.create({
          userId: currentUserId,
          newEmail: 'pending@test.fr',
          token: 'token',
          expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
        })

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(1)

        await request
          .post(path)
          .send({ new_email: 'newemail@test.fr' })
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              message: 'An email change request is already pending, please retry later',
            }),
          )

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(1)
        await expectMail().waitFor(500).hasNumberOfEmails(0)
      })

      it('should create email change verification when valid input', async () => {
        const newEmail = 'newemail@test.fr'

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(0)

        await request.post(path).send({ new_email: newEmail }).expect(201)

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION)
          .hasNumberOfRows(1)
          .row(0)
          .toEqual({
            id: expect.toBeString(),
            user_id: currentUserId,
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
          .hasReceiveInAnyOrder([
            {
              subject: "[Wishlist] Confirmez votre changement d'adresse email",
              from: 'contact@wishlistapp.fr',
              to: newEmail,
            },
            {
              subject: "[Wishlist] Demande de changement d'adresse email",
              from: 'contact@wishlistapp.fr',
              to: BASE_USER_EMAIL,
            },
          ])
      })

      it('should create email change verification when valid input and pending email change request exists but expired', async () => {
        const newEmail = 'newemail@test.fr'

        await factories.userEmailChangeVerification.create({
          userId: currentUserId,
          newEmail: 'pending@test.fr',
          token: 'token',
          expiredAt: DateTime.now().minus({ hour: 1 }).toJSDate(),
        })

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(1)

        await request.post(path).send({ new_email: newEmail }).expect(201)

        await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION)
          .hasNumberOfRows(2)
          .row(1)
          .toEqual({
            id: expect.toBeString(),
            user_id: currentUserId,
            new_email: newEmail,
            token: expect.toBeString(),
            expired_at: expect.toBeAfter(new Date()),
            created_at: expect.toBeDate(),
            updated_at: expect.toBeDate(),
          })

        // Should send 2 emails: one to new email, one to old email
        await expectMail().waitFor(500).hasNumberOfEmails(2)
      })
    })
  })

  describe('POST /user/email-change/confirm', () => {
    const path = '/user/email-change/confirm'

    let request: RequestApp

    beforeEach(async () => {
      request = await getRequest()
    })

    it.each([
      {
        body: {},
        case: 'empty body',
        message: ['new_email should not be empty', 'token should not be empty'],
      },
      {
        body: { new_email: 'invalid-email', token: 123 },
        case: 'invalid types',
        message: ['new_email must be an email', 'token must be a string'],
      },
    ])('should return 400 when invalid input: $case', async ({ body, message }) => {
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
      await factories.user.createBase()

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
      const { id: userId } = await factories.user.createBase()
      const newEmail = 'newemail@test.fr'
      const token = 'test-token'

      await factories.userEmailChangeVerification.create({
        userId,
        newEmail,
        token,
        expiredAt: DateTime.now().minus({ hour: 1 }).toJSDate(),
      })

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
      await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(1)
      // User email should not be changed
      await expectTable(Tables.USER).row(0).toMatchObject({
        email: BASE_USER_EMAIL,
      })
    })

    it('should fail when new email is already taken by another user', async () => {
      const { id: userId } = await factories.user.createBase()
      await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })
      const newEmail = 'other@test.fr'
      const token = 'test-token'

      await factories.userEmailChangeVerification.create({
        userId,
        newEmail,
        token,
        expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
      })

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
      await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(1)
      // User email should not be changed
      await expectTable(Tables.USER).row(0).toMatchObject({
        email: BASE_USER_EMAIL,
      })
    })

    it('should change email with valid input', async () => {
      const { id: userId } = await factories.user.createBase()
      const newEmail = 'newemail@test.fr'
      const token = 'test-token'

      await factories.userEmailChangeVerification.create({
        userId,
        newEmail,
        token,
        expiredAt: DateTime.now().plus({ hour: 1 }).toJSDate(),
      })

      await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION).hasNumberOfRows(1)

      await request.post(path).send({ new_email: newEmail, token }).expect(201)

      // User email should be updated
      await expectTable(Tables.USER).row(0).toMatchObject({
        id: userId,
        email: newEmail,
      })

      // Verification should be invalidated
      await expectTable(Tables.USER_EMAIL_CHANGE_VERIFICATION)
        .row(0)
        .toMatchObject({
          expired_at: expect.toBeBefore(DateTime.now().toJSDate()),
        })

      // Should send 2 emails: one to old email, one to new email
      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(2)
        .hasReceiveInAnyOrder([
          {
            subject: '[Wishlist] Votre adresse email a été modifiée',
            from: 'contact@wishlistapp.fr',
            to: BASE_USER_EMAIL,
          },
          {
            subject: '[Wishlist] Votre adresse email a été mise à jour',
            from: 'contact@wishlistapp.fr',
            to: newEmail,
          },
        ])
    })
  })
})
