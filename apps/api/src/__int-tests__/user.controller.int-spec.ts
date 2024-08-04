import { uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

import {
  BASE_USER_EMAIL,
  DEFAULT_USER_PASSWORD,
  EVENT_ATTENDEE_TABLE,
  insertAdminUser,
  insertBaseUser,
  insertEvent,
  insertPendingAttendee,
  RequestApp,
  USER_EMAIL_SETTING_TABLE,
  USER_TABLE,
  useTestApp,
  useTestMail,
} from './utils'

describe('UserController', () => {
  const { getRequest, expectTable, getDatasource } = useTestApp()

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
            email: BASE_USER_EMAIL,
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

      await expectTable(USER_TABLE).hasNumberOfRows(0).check()
    })

    describe('when valid input', () => {
      const { expectMail } = useTestMail()
      const input = { email: BASE_USER_EMAIL, password: DEFAULT_USER_PASSWORD, firstname: 'John', lastname: 'Doe' }

      it('should fail when email already exists', async () => {
        await insertBaseUser(getDatasource())

        await expectTable(USER_TABLE).hasNumberOfRows(1).check()

        await request
          .post(path)
          .send(input)
          .expect(422)
          .expect(({ body }) => expect(body).toMatchObject({ message: 'Unprocessable Entity' }))

        await expectTable(USER_TABLE).hasNumberOfRows(1).check()
      })

      it('should create user', async () => {
        await expectTable(USER_TABLE).hasNumberOfRows(0).check()

        const res = await request
          .post(path)
          .send(input)
          .expect(201)
          .expect(({ body }) =>
            expect(body).toEqual({
              id: expect.toBeString(),
              email: BASE_USER_EMAIL,
              firstname: 'John',
              lastname: 'Doe',
            }),
          )

        const userId = res.body.id

        await expectTable(USER_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: userId,
            email: BASE_USER_EMAIL,
            first_name: 'John',
            last_name: 'Doe',
            authorities: ['ROLE_USER'],
            is_enabled: true,
            password_enc: expect.toBeString(),
            picture_url: null,
            last_connected_at: expect.toBeDateString(),
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          })
          .check()

        await expectTable(USER_EMAIL_SETTING_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toEqual({
            id: expect.toBeString(),
            user_id: userId,
            daily_new_item_notification: true,
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          })
          .check()

        await expectMail()
          .waitFor(1000)
          .hasNumberOfEmails(1)
          .mail(0)
          .hasSubject('[Wishlist] Bienvenue !!!')
          .hasSender('contact@wishlistapp.fr')
          .hasReceiver(BASE_USER_EMAIL)
          .check()
      })

      it('should create user and join event if invited as pending', async () => {
        const datasource = getDatasource()

        const creatorId = await insertAdminUser(datasource)

        const eventId = uuid()
        await insertEvent(datasource, {
          id: eventId,
          title: 'Event',
          description: 'Description',
          eventDate: new Date(),
          creatorId,
        })

        const attendeeId = uuid()
        await insertPendingAttendee(datasource, {
          id: attendeeId,
          eventId: eventId,
          tempUserEmail: BASE_USER_EMAIL,
        })

        await expectTable(USER_TABLE).hasNumberOfRows(1).check()

        const res = await request.post(path).send(input).expect(201)

        await expectTable(USER_TABLE).hasNumberOfRows(2).check()
        await expectTable(USER_EMAIL_SETTING_TABLE).hasNumberOfRows(1).check()

        await expectTable(EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(1)
          .row(0)
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

      await expectTable(USER_TABLE)
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
})
