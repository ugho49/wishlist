import * as request from 'supertest'

import 'jest-extended'

import { uuid } from '@wishlist/common'

import {
  EVENT_ATTENDEE_TABLE,
  insertEvent,
  insertPendingAttendee,
  insertUser,
  USER_EMAIL_SETTING_TABLE,
  USER_TABLE,
  useTestApp,
} from './utils'

describe('UserController', () => {
  const { getHttpServer, expectTable, getDatasource } = useTestApp()

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
      const input = { email: 'test@test.fr', password: 'Password123', firstname: 'John', lastname: 'Doe' }

      it('should fail when email already exists', async () => {
        const dataSource = getDatasource()

        await insertUser(dataSource, {
          id: uuid(),
          email: 'test@test.fr',
          firstname: 'John',
          lastname: 'Doe',
          password_enc: 'password_enc',
        })

        await expectTable(USER_TABLE).hasNumberOfRows(1).check()

        await request(getHttpServer())
          .post(path)
          .send(input)
          .expect(422)
          .expect(({ body }) => expect(body).toMatchObject({ message: 'Unprocessable Entity' }))

        await expectTable(USER_TABLE).hasNumberOfRows(1).check()
      })

      it('should create user', async () => {
        await expectTable(USER_TABLE).hasNumberOfRows(0).check()

        const res = await request(getHttpServer())
          .post(path)
          .send(input)
          .expect(201)
          .expect(({ body }) =>
            expect(body).toEqual({
              id: expect.toBeString(),
              email: 'test@test.fr',
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
            email: 'test@test.fr',
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

        // TODO: assert WelcomeEmail Sent
      })

      it('should create user and join event if invited as pending', async () => {
        const dataSource = getDatasource()

        const creatorId = uuid()
        await insertUser(dataSource, {
          id: creatorId,
          email: 'admin@admin.fr',
          firstname: 'John',
          lastname: 'Doe',
          password_enc: 'password_enc',
        })

        const eventId = uuid()
        await insertEvent(dataSource, {
          id: eventId,
          title: 'Event',
          description: 'Description',
          eventDate: new Date(),
          creatorId,
        })

        const attendeeId = uuid()
        await insertPendingAttendee(dataSource, {
          id: attendeeId,
          eventId: eventId,
          tempUserEmail: 'test@test.fr',
        })

        await expectTable(USER_TABLE).hasNumberOfRows(1).check()

        const res = await request(getHttpServer())
          .post(path)
          .send(input)
          .expect(201)
          .expect(({ body }) =>
            expect(body).toEqual({
              id: expect.toBeString(),
              email: 'test@test.fr',
              firstname: 'John',
              lastname: 'Doe',
            }),
          )

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
})
