import type { RequestApp } from '../../../test-utils'

import { DateTime } from 'luxon'

import { Fixtures, useTestApp, useTestMail } from '../../../test-utils'
import { PasswordManager } from '../../auth'

describe('UserController', () => {
  const { getRequest, expectTable, getFixtures } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('GET /user', () => {
    const path = '/user'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.get(path).expect(401)
    })

    it('should return user infos if authenticated', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await request
        .get(path)
        .expect(200)
        .expect(({ body }) =>
          expect(body).toEqual({
            id: expect.toBeString(),
            email: Fixtures.BASE_USER_EMAIL,
            firstname: 'John',
            lastname: 'Doe',
            last_connected_at: expect.toBeDateString(),
            last_ip: expect.toBeString(),
            is_enabled: true,
            admin: false,
            social: [],
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          }),
        )
    })
  })

  describe('POST /user/register', () => {
    const path = '/user/register'

    let request: RequestApp

    beforeEach(async () => {
      request = await getRequest()
    })

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
      {
        body: { email: 'test@test.fr', password: '123' },
        case: 'too short password',
        message: ['password must be longer than or equal to 8 characters'],
      },
      {
        body: {
          email: 'test@test.fr',
          password: 'password123',
          firstname: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          lastname: 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        },
        case: 'too long firstname and lastname',
        message: [
          'firstname must be shorter than or equal to 50 characters',
          'lastname must be shorter than or equal to 50 characters',
        ],
      },
    ])('should return 400 when invalid input: $case', async ({ body, message }) => {
      await request
        .post(path)
        .send(body)
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
        )

      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(0).check()
    })

    describe('when valid input', () => {
      const { expectMail } = useTestMail()
      const input = {
        email: Fixtures.BASE_USER_EMAIL,
        password: Fixtures.DEFAULT_USER_PASSWORD,
        firstname: 'John',
        lastname: 'Doe',
      }

      it('should fail when email already exists', async () => {
        await fixtures.insertBaseUser()

        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1).check()

        await request
          .post(path)
          .send(input)
          .expect(422)
          .expect(({ body }) => expect(body).toMatchObject({ message: 'Unprocessable Entity' }))

        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1).check()
      })

      it('should create user', async () => {
        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(0).check()

        const res = await request
          .post(path)
          .send(input)
          .expect(201)
          .expect(({ body }) =>
            expect(body).toEqual({
              id: expect.toBeString(),
              email: Fixtures.BASE_USER_EMAIL,
              firstname: 'John',
              lastname: 'Doe',
            }),
          )

        const userId = res.body.id

        await expectTable(Fixtures.USER_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: userId,
            email: Fixtures.BASE_USER_EMAIL,
            first_name: 'John',
            last_name: 'Doe',
            authorities: ['ROLE_USER'],
            is_enabled: true,
            picture_url: null,
            last_connected_at: expect.toBeDate(),
            created_at: expect.toBeDate(),
            updated_at: expect.toBeDate(),
          })
          .expectColumn<string>('password_enc', async value => {
            const res = await PasswordManager.verify({ hash: value, plainPassword: input.password })
            expect(res, 'Password should match').toBe(true)
          })
          .check()

        await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toEqual({
            id: expect.toBeString(),
            user_id: userId,
            daily_new_item_notification: true,
            created_at: expect.toBeDate(),
            updated_at: expect.toBeDate(),
          })
          .check()

        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(1)
          .mail(0)
          .hasSubject('[Wishlist] Bienvenue !!!')
          .hasSender('contact@wishlistapp.fr')
          .hasReceiver(Fixtures.BASE_USER_EMAIL)
          .check()
      })

      it('should create user and join event if invited as pending', async () => {
        const creatorId = await fixtures.insertAdminUser()

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          description: 'Description',
          eventDate: new Date(),
          maintainerId: creatorId,
        })

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: Fixtures.BASE_USER_EMAIL,
        })

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(2)
          .row(1)
          .toMatchObject({
            id: attendeeId,
            event_id: eventId,
            user_id: null,
            temp_user_email: Fixtures.BASE_USER_EMAIL,
          })
          .check()

        const res = await request.post(path).send(input).expect(201)

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(2)
          .row(1)
          .toMatchObject({
            id: attendeeId,
            event_id: eventId,
            user_id: res.body.id,
            temp_user_email: null,
          })
          .check()
      })
    })
  })

  describe('PUT /user', () => {
    const path = '/user'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.put(path).expect(401)
    })

    it.each([
      {
        body: {},
        case: 'empty body',
        message: [
          'firstname must be shorter than or equal to 50 characters',
          'lastname must be shorter than or equal to 50 characters',
        ],
      },
      {
        body: {
          firstname: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
        case: 'too long firstname',
        message: ['firstname must be shorter than or equal to 50 characters'],
      },
      {
        body: {
          lastname: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
        case: 'too long firstname',
        message: ['lastname must be shorter than or equal to 50 characters'],
      },
      {
        body: {
          birthday: 'not-a-day',
        },
        case: 'birthday not a date',
        message: ['birthday must be a Date instance'],
      },
      {
        body: {
          birthday: DateTime.now().plus({ days: 1 }).toISODate(),
        },
        case: 'birthday in future',
        message: [expect.stringMatching('maximal allowed date for birthday is')],
      },
    ])('should return 400 when invalid input: $case', async ({ body, message }) => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await request
        .put(path)
        .send(body)
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
        )
    })

    it('should update user when valid input', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      // const birthday = DateTime.fromObject({ year: 1993, month: 11, day: 15 }).toISODate()
      await request
        .put(path)
        .send({
          firstname: 'Updated',
          lastname: 'UPDATED',
          // birthday,
        })
        .expect(200)

      await expectTable(Fixtures.USER_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .toMatchObject({
          first_name: 'Updated',
          last_name: 'UPDATED',
          // birthday,
        })
        .check()
    })
  })

  describe('PUT /user/change-password', () => {
    const path = '/user/change-password'
    const newPassword = 'NewPassword123'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.put(path).expect(401)
    })

    it.each([
      {
        body: {},
        case: 'empty body',
        message: ['old_password should not be empty', 'new_password must be shorter than or equal to 50 characters'],
      },
      {
        body: {
          old_password: 123456789,
        },
        case: 'old_password not a string',
        message: ['old_password must be a string'],
      },
      {
        body: {
          new_password: '2small',
        },
        case: 'new_password too short',
        message: ['new_password must be longer than or equal to 8 characters'],
      },
    ])('should return 400 when invalid input: $case', async ({ body, message }) => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await request
        .put(path)
        .send(body)
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
        )
    })

    it('should not update user password when old password not match', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await request
        .put(path)
        .send({
          old_password: 'wrong-password',
          new_password: newPassword,
        })
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({ error: 'Bad Request', message: "Old password don't match with user password" }),
        )

      await expectTable(Fixtures.USER_TABLE)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const res = await PasswordManager.verify({ hash: value, plainPassword: Fixtures.DEFAULT_USER_PASSWORD })
          expect(res, 'Password should match').toBe(true)
        })
        .check()
    })

    it('should update user password when valid input', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await request
        .put(path)
        .send({
          old_password: Fixtures.DEFAULT_USER_PASSWORD,
          new_password: newPassword,
        })
        .expect(200)

      await expectTable(Fixtures.USER_TABLE)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const res = await PasswordManager.verify({ hash: value, plainPassword: newPassword })
          expect(res, 'Password should match').toBe(true)
        })
        .check()
    })
  })
})
