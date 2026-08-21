import type { RequestApp } from '@wishlist/api-test-utils'

import { PasswordManager } from '@wishlist/api/auth'
import { BASE_USER_EMAIL, DEFAULT_USER_PASSWORD, Factories, Tables, useTestApp } from '@wishlist/api-test-utils'
import { sleep } from '@wishlist/common'
import { DateTime } from 'luxon'

describe('UserController', () => {
  const { getRequest, expectTable, getFactories, expectMail } = useTestApp()
  let factories: Factories

  beforeEach(() => {
    factories = getFactories()
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

      await expectTable(Tables.USER).hasNumberOfRows(0)
    })

    describe('when valid input', () => {
      const input = {
        email: BASE_USER_EMAIL,
        password: DEFAULT_USER_PASSWORD,
        firstname: 'John',
        lastname: 'Doe',
      }

      it('should fail when email already exists', async () => {
        await factories.user.createBase()

        await expectTable(Tables.USER).hasNumberOfRows(1)
        await request
          .post(path)
          .send(input)
          .expect(401)
          .expect(({ body }) => expect(body).toMatchObject({ message: 'User email already taken' }))

        await expectTable(Tables.USER).hasNumberOfRows(1)
      })

      it('should create user', async () => {
        await expectTable(Tables.USER).hasNumberOfRows(0)
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

        await expectTable(Tables.USER)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({
            id: userId,
            email: BASE_USER_EMAIL,
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

        await expectTable(Tables.USER_EMAIL_SETTING).hasNumberOfRows(1).row(0).toEqual({
          id: expect.toBeString(),
          user_id: userId,
          daily_new_item_notification: true,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        })

        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(1)
          .mail(0)
          .hasSubject('[Wishlist] Bienvenue !!!')
          .hasSender('contact@wishlistapp.fr')
          .hasReceiver(BASE_USER_EMAIL)
      })

      it('should create user and join event if invited as pending', async () => {
        const { id: creatorId } = await factories.user.createAdmin()

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Description',
          eventDate: new Date(),
          maintainerId: creatorId,
        })

        const { id: attendeeId } = await factories.eventAttendee.createPending({
          eventId,
          tempUserEmail: BASE_USER_EMAIL,
        })

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(2).row(1).toMatchObject({
          id: attendeeId,
          event_id: eventId,
          user_id: null,
          temp_user_email: BASE_USER_EMAIL,
        })

        const res = await request.post(path).send(input).expect(201)

        await sleep(500)

        await expectTable(Tables.EVENT_ATTENDEE).hasNumberOfRows(2).row(1).toMatchObject({
          id: attendeeId,
          event_id: eventId,
          user_id: res.body.id,
          temp_user_email: null,
        })
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

      const birthday = DateTime.fromObject({ year: 1993, month: 11, day: 15 }).toISODate()

      await request
        .put(path)
        .send({
          firstname: 'Updated',
          lastname: 'UPDATED',
          birthday,
        })
        .expect(200)

      await expectTable(Tables.USER)
        .hasNumberOfRows(1)
        .row(0)
        .toMatchObject({
          first_name: 'Updated',
          last_name: 'UPDATED',
          birthday: new Date('1993-11-15'),
        })
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

      await expectTable(Tables.USER)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const res = await PasswordManager.verify({ hash: value, plainPassword: DEFAULT_USER_PASSWORD })
          expect(res, 'Password should match').toBe(true)
        })
    })

    it('should update user password when valid input', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await request
        .put(path)
        .send({
          old_password: DEFAULT_USER_PASSWORD,
          new_password: newPassword,
        })
        .expect(200)

      await expectTable(Tables.USER)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const res = await PasswordManager.verify({ hash: value, plainPassword: newPassword })
          expect(res, 'Password should match').toBe(true)
        })
    })
  })

  describe('GET /user/closest-friends', () => {
    const path = '/user/closest-friends'

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

      it('should return 400 when limit is greater than max limit', async () => {
        await request
          .get(path)
          .query({ limit: 51 })
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Bad Request',
              message: 'Limit cannot be greater than 50',
            }),
          )
      })

      it('should return empty array when no common events', async () => {
        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual([])
          })
      })

      it('should return closest friends based on common events', async () => {
        // Create additional users
        const { id: user2Id } = await factories.user.create({
          email: 'user2@test.com',
          firstName: 'Alice',
          lastName: 'Smith',
        })

        const { id: user3Id } = await factories.user.create({
          email: 'user3@test.com',
          firstName: 'Bob',
          lastName: 'Johnson',
        })

        const { id: user4Id } = await factories.user.create({
          email: 'user4@test.com',
          firstName: 'Charlie',
          lastName: 'Brown',
        })

        // Create events
        const {
          event: { id: event1Id },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'First event',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const {
          event: { id: event2Id },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Second event',
          eventDate: DateTime.now().plus({ days: 2 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const {
          event: { id: event3Id },
        } = await factories.event.createWithMaintainer({
          title: 'Event 3',
          description: 'Third event',
          eventDate: DateTime.now().plus({ days: 3 }).toJSDate(),
          maintainerId: currentUserId,
        })

        // Add attendees to events
        // user2 participates in 2 events with current user (event1, event2)
        await factories.eventAttendee.create({ eventId: event1Id, userId: user2Id })
        await factories.eventAttendee.create({ eventId: event2Id, userId: user2Id })

        // user3 participates in 1 event with current user (event1)
        await factories.eventAttendee.create({ eventId: event1Id, userId: user3Id })

        // user4 participates in 1 event with current user (event3)
        await factories.eventAttendee.create({ eventId: event3Id, userId: user4Id })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual([
              // user2 should be first (2 common events)
              {
                id: user2Id,
                firstname: 'Alice',
                lastname: 'Smith',
                email: 'user2@test.com',
              },
              // user3 and user4 should follow (1 common event each)
              // Order between them depends on implementation but both should be present
              expect.objectContaining({
                id: expect.stringMatching(new RegExp(`^(${user3Id}|${user4Id})$`)),
                firstname: expect.stringMatching(/^(Bob|Charlie)$/),
                lastname: expect.stringMatching(/^(Johnson|Brown)$/),
                email: expect.stringMatching(/^(user3@test\.com|user4@test\.com)$/),
              }),
              expect.objectContaining({
                id: expect.stringMatching(new RegExp(`^(${user3Id}|${user4Id})$`)),
                firstname: expect.stringMatching(/^(Bob|Charlie)$/),
                lastname: expect.stringMatching(/^(Johnson|Brown)$/),
                email: expect.stringMatching(/^(user3@test\.com|user4@test\.com)$/),
              }),
            ])
          })
      })

      it('should respect limit parameter', async () => {
        // Create users and events
        const { id: user2Id } = await factories.user.create({
          email: 'user2@test.com',
          firstName: 'Alice',
          lastName: 'Smith',
        })

        const { id: user3Id } = await factories.user.create({
          email: 'user3@test.com',
          firstName: 'Bob',
          lastName: 'Johnson',
        })

        const {
          event: { id: eventId },
        } = await factories.event.createWithMaintainer({
          title: 'Event',
          description: 'Test event',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        await factories.eventAttendee.create({ eventId, userId: user2Id })
        await factories.eventAttendee.create({ eventId, userId: user3Id })

        await request
          .get(path)
          .query({ limit: 1 })
          .expect(200)
          .expect(({ body }) => {
            expect(body).toHaveLength(1)
          })
      })

      it('should handle complex scenario with many users and events', async () => {
        // Create 6 additional users
        const { id: aliceId } = await factories.user.create({
          email: 'alice@test.com',
          firstName: 'Alice',
          lastName: 'Wonder',
        })

        const { id: bobId } = await factories.user.create({
          email: 'bob@test.com',
          firstName: 'Bob',
          lastName: 'Builder',
        })

        const { id: charlieId } = await factories.user.create({
          email: 'charlie@test.com',
          firstName: 'Charlie',
          lastName: 'Chaplin',
        })

        const { id: dianaId } = await factories.user.create({
          email: 'diana@test.com',
          firstName: 'Diana',
          lastName: 'Prince',
        })

        const { id: eveId } = await factories.user.create({
          email: 'eve@test.com',
          firstName: 'Eve',
          lastName: 'Adams',
        })

        const { id: frankId } = await factories.user.create({
          email: 'frank@test.com',
          firstName: 'Frank',
          lastName: 'Sinatra',
        })

        // Create 5 events
        const {
          event: { id: birthdayId },
        } = await factories.event.createWithMaintainer({
          title: 'Birthday Party',
          description: 'Annual birthday celebration',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const {
          event: { id: christmasId },
        } = await factories.event.createWithMaintainer({
          title: 'Christmas Party',
          description: 'Holiday celebration',
          eventDate: DateTime.now().plus({ days: 30 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const {
          event: { id: weddingId },
        } = await factories.event.createWithMaintainer({
          title: 'Wedding',
          description: 'Wedding ceremony',
          eventDate: DateTime.now().plus({ days: 60 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const {
          event: { id: babyShowerId },
        } = await factories.event.createWithMaintainer({
          title: 'Baby Shower',
          description: 'Baby shower party',
          eventDate: DateTime.now().plus({ days: 90 }).toJSDate(),
          maintainerId: currentUserId,
        })

        const {
          event: { id: graduationId },
        } = await factories.event.createWithMaintainer({
          title: 'Graduation',
          description: 'Graduation ceremony',
          eventDate: DateTime.now().plus({ days: 120 }).toJSDate(),
          maintainerId: currentUserId,
        })

        // Alice participates in 4 events with current user (closest friend)
        await factories.eventAttendee.create({ eventId: birthdayId, userId: aliceId })
        await factories.eventAttendee.create({ eventId: christmasId, userId: aliceId })
        await factories.eventAttendee.create({ eventId: weddingId, userId: aliceId })
        await factories.eventAttendee.create({ eventId: babyShowerId, userId: aliceId })

        // Bob participates in 3 events with current user
        await factories.eventAttendee.create({ eventId: birthdayId, userId: bobId })
        await factories.eventAttendee.create({ eventId: christmasId, userId: bobId })
        await factories.eventAttendee.create({ eventId: weddingId, userId: bobId })

        // Charlie participates in 3 events with current user (tied with Bob)
        await factories.eventAttendee.create({ eventId: christmasId, userId: charlieId })
        await factories.eventAttendee.create({ eventId: babyShowerId, userId: charlieId })
        await factories.eventAttendee.create({ eventId: graduationId, userId: charlieId })

        // Diana participates in 2 events with current user
        await factories.eventAttendee.create({ eventId: weddingId, userId: dianaId })
        await factories.eventAttendee.create({ eventId: babyShowerId, userId: dianaId })

        // Eve participates in 1 event with current user
        await factories.eventAttendee.create({ eventId: graduationId, userId: eveId })

        // Frank doesn't participate in any events with current user (should not appear)

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toHaveLength(5) // All except Frank

            // Alice should be first (4 common events)
            expect(body[0]).toEqual({
              id: aliceId,
              firstname: 'Alice',
              lastname: 'Wonder',
              email: 'alice@test.com',
            })

            // Bob and Charlie should be 2nd and 3rd (3 common events each)
            const bobAndCharlie = body.slice(1, 3)
            expect(bobAndCharlie).toEqual(
              expect.arrayContaining([
                {
                  id: bobId,
                  firstname: 'Bob',
                  lastname: 'Builder',
                  email: 'bob@test.com',
                },
                {
                  id: charlieId,
                  firstname: 'Charlie',
                  lastname: 'Chaplin',
                  email: 'charlie@test.com',
                },
              ]),
            )

            // Diana should be 4th (2 common events)
            expect(body[3]).toEqual({
              id: dianaId,
              firstname: 'Diana',
              lastname: 'Prince',
              email: 'diana@test.com',
            })

            // Eve should be 5th (1 common event)
            expect(body[4]).toEqual({
              id: eveId,
              firstname: 'Eve',
              lastname: 'Adams',
              email: 'eve@test.com',
            })

            // Frank should not appear (0 common events)
            // biome-ignore lint/suspicious/noExplicitAny: for the test
            expect(body.map((u: any) => u.id)).not.toContain(frankId)
          })
      })

      it('should handle users who participate in events but not with current user', async () => {
        // Create another maintainer
        const { id: otherMaintainerId } = await factories.user.create({
          email: 'other@test.com',
          firstName: 'Other',
          lastName: 'User',
        })

        // Create users
        const { id: user1Id } = await factories.user.create({
          email: 'user1@test.com',
          firstName: 'User',
          lastName: 'One',
        })

        const { id: user2Id } = await factories.user.create({
          email: 'user2@test.com',
          firstName: 'User',
          lastName: 'Two',
        })

        // Create events - current user participates in event1
        const {
          event: { id: event1Id },
        } = await factories.event.createWithMaintainer({
          title: 'Event 1',
          description: 'Current user event',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        // Other maintainer creates event2 - current user doesn't participate
        const {
          event: { id: event2Id },
        } = await factories.event.createWithMaintainer({
          title: 'Event 2',
          description: 'Other user event',
          eventDate: DateTime.now().plus({ days: 2 }).toJSDate(),
          maintainerId: otherMaintainerId,
        })

        // user1 participates with current user in event1
        await factories.eventAttendee.create({ eventId: event1Id, userId: user1Id })

        // user2 only participates in event2 (not with current user)
        await factories.eventAttendee.create({ eventId: event2Id, userId: user2Id })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toHaveLength(1)
            expect(body[0]).toEqual({
              id: user1Id,
              firstname: 'User',
              lastname: 'One',
              email: 'user1@test.com',
            })
            // user2 should not appear as they don't share events with current user
            // biome-ignore lint/suspicious/noExplicitAny: for the test
            expect(body.map((u: any) => u.id)).not.toContain(user2Id)
          })
      })

      it('should return empty array when user participates in events but no other users do', async () => {
        // Current user is maintainer but no other attendees
        await factories.event.createWithMaintainer({
          title: 'Solo Event',
          description: 'Event with only current user',
          eventDate: DateTime.now().plus({ days: 1 }).toJSDate(),
          maintainerId: currentUserId,
        })

        await request
          .get(path)
          .expect(200)
          .expect(({ body }) => {
            expect(body).toEqual([])
          })
      })
    })
  })

  // TODO: GET /user/search
  // TODO: DELETE /user/picture
  // TODO: PUT /user/picture
})
