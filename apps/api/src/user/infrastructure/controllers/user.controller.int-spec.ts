import type { RequestApp } from '@wishlist/api-test-utils'

import { PasswordManager } from '@wishlist/api/auth'
import { Fixtures, useTestApp, useTestMail } from '@wishlist/api-test-utils'
import { addDays, formatISODate, sleep } from '@wishlist/common'

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

      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(0)
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

        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)
        await request
          .post(path)
          .send(input)
          .expect(401)
          .expect(({ body }) => expect(body).toMatchObject({ message: 'User email already taken' }))

        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(1)
      })

      it('should create user', async () => {
        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(0)
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

        await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE).hasNumberOfRows(1).row(0).toEqual({
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
          .hasReceiver(Fixtures.BASE_USER_EMAIL)
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

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2).row(1).toMatchObject({
          id: attendeeId,
          event_id: eventId,
          user_id: null,
          temp_user_email: Fixtures.BASE_USER_EMAIL,
        })

        const res = await request.post(path).send(input).expect(201)

        await sleep(500)

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2).row(1).toMatchObject({
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
          birthday: formatISODate(addDays(new Date(), 1)),
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

      const birthday = formatISODate(new Date(1993, 10, 15))

      await request
        .put(path)
        .send({
          firstname: 'Updated',
          lastname: 'UPDATED',
          birthday,
        })
        .expect(200)

      await expectTable(Fixtures.USER_TABLE)
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

      await expectTable(Fixtures.USER_TABLE)
        .row(0)
        .expectColumn<string>('password_enc', async value => {
          const res = await PasswordManager.verify({ hash: value, plainPassword: Fixtures.DEFAULT_USER_PASSWORD })
          expect(res, 'Password should match').toBe(true)
        })
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
        currentUserId = await fixtures.getSignedUserId('BASE_USER')
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
        const user2Id = await fixtures.insertUser({
          email: 'user2@test.com',
          firstname: 'Alice',
          lastname: 'Smith',
        })

        const user3Id = await fixtures.insertUser({
          email: 'user3@test.com',
          firstname: 'Bob',
          lastname: 'Johnson',
        })

        const user4Id = await fixtures.insertUser({
          email: 'user4@test.com',
          firstname: 'Charlie',
          lastname: 'Brown',
        })

        // Create events
        const { eventId: event1Id } = await fixtures.insertEventWithMaintainer({
          title: 'Event 1',
          description: 'First event',
          eventDate: addDays(new Date(), 1),
          maintainerId: currentUserId,
        })

        const { eventId: event2Id } = await fixtures.insertEventWithMaintainer({
          title: 'Event 2',
          description: 'Second event',
          eventDate: addDays(new Date(), 2),
          maintainerId: currentUserId,
        })

        const { eventId: event3Id } = await fixtures.insertEventWithMaintainer({
          title: 'Event 3',
          description: 'Third event',
          eventDate: addDays(new Date(), 3),
          maintainerId: currentUserId,
        })

        // Add attendees to events
        // user2 participates in 2 events with current user (event1, event2)
        await fixtures.insertActiveAttendee({ eventId: event1Id, userId: user2Id })
        await fixtures.insertActiveAttendee({ eventId: event2Id, userId: user2Id })

        // user3 participates in 1 event with current user (event1)
        await fixtures.insertActiveAttendee({ eventId: event1Id, userId: user3Id })

        // user4 participates in 1 event with current user (event3)
        await fixtures.insertActiveAttendee({ eventId: event3Id, userId: user4Id })

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
        const user2Id = await fixtures.insertUser({
          email: 'user2@test.com',
          firstname: 'Alice',
          lastname: 'Smith',
        })

        const user3Id = await fixtures.insertUser({
          email: 'user3@test.com',
          firstname: 'Bob',
          lastname: 'Johnson',
        })

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          description: 'Test event',
          eventDate: addDays(new Date(), 1),
          maintainerId: currentUserId,
        })

        await fixtures.insertActiveAttendee({ eventId, userId: user2Id })
        await fixtures.insertActiveAttendee({ eventId, userId: user3Id })

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
        const aliceId = await fixtures.insertUser({
          email: 'alice@test.com',
          firstname: 'Alice',
          lastname: 'Wonder',
        })

        const bobId = await fixtures.insertUser({
          email: 'bob@test.com',
          firstname: 'Bob',
          lastname: 'Builder',
        })

        const charlieId = await fixtures.insertUser({
          email: 'charlie@test.com',
          firstname: 'Charlie',
          lastname: 'Chaplin',
        })

        const dianaId = await fixtures.insertUser({
          email: 'diana@test.com',
          firstname: 'Diana',
          lastname: 'Prince',
        })

        const eveId = await fixtures.insertUser({
          email: 'eve@test.com',
          firstname: 'Eve',
          lastname: 'Adams',
        })

        const frankId = await fixtures.insertUser({
          email: 'frank@test.com',
          firstname: 'Frank',
          lastname: 'Sinatra',
        })

        // Create 5 events
        const { eventId: birthdayId } = await fixtures.insertEventWithMaintainer({
          title: 'Birthday Party',
          description: 'Annual birthday celebration',
          eventDate: addDays(new Date(), 1),
          maintainerId: currentUserId,
        })

        const { eventId: christmasId } = await fixtures.insertEventWithMaintainer({
          title: 'Christmas Party',
          description: 'Holiday celebration',
          eventDate: addDays(new Date(), 30),
          maintainerId: currentUserId,
        })

        const { eventId: weddingId } = await fixtures.insertEventWithMaintainer({
          title: 'Wedding',
          description: 'Wedding ceremony',
          eventDate: addDays(new Date(), 60),
          maintainerId: currentUserId,
        })

        const { eventId: babyShowerId } = await fixtures.insertEventWithMaintainer({
          title: 'Baby Shower',
          description: 'Baby shower party',
          eventDate: addDays(new Date(), 90),
          maintainerId: currentUserId,
        })

        const { eventId: graduationId } = await fixtures.insertEventWithMaintainer({
          title: 'Graduation',
          description: 'Graduation ceremony',
          eventDate: addDays(new Date(), 120),
          maintainerId: currentUserId,
        })

        // Alice participates in 4 events with current user (closest friend)
        await fixtures.insertActiveAttendee({ eventId: birthdayId, userId: aliceId })
        await fixtures.insertActiveAttendee({ eventId: christmasId, userId: aliceId })
        await fixtures.insertActiveAttendee({ eventId: weddingId, userId: aliceId })
        await fixtures.insertActiveAttendee({ eventId: babyShowerId, userId: aliceId })

        // Bob participates in 3 events with current user
        await fixtures.insertActiveAttendee({ eventId: birthdayId, userId: bobId })
        await fixtures.insertActiveAttendee({ eventId: christmasId, userId: bobId })
        await fixtures.insertActiveAttendee({ eventId: weddingId, userId: bobId })

        // Charlie participates in 3 events with current user (tied with Bob)
        await fixtures.insertActiveAttendee({ eventId: christmasId, userId: charlieId })
        await fixtures.insertActiveAttendee({ eventId: babyShowerId, userId: charlieId })
        await fixtures.insertActiveAttendee({ eventId: graduationId, userId: charlieId })

        // Diana participates in 2 events with current user
        await fixtures.insertActiveAttendee({ eventId: weddingId, userId: dianaId })
        await fixtures.insertActiveAttendee({ eventId: babyShowerId, userId: dianaId })

        // Eve participates in 1 event with current user
        await fixtures.insertActiveAttendee({ eventId: graduationId, userId: eveId })

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
        const otherMaintainerId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        })

        // Create users
        const user1Id = await fixtures.insertUser({
          email: 'user1@test.com',
          firstname: 'User',
          lastname: 'One',
        })

        const user2Id = await fixtures.insertUser({
          email: 'user2@test.com',
          firstname: 'User',
          lastname: 'Two',
        })

        // Create events - current user participates in event1
        const { eventId: event1Id } = await fixtures.insertEventWithMaintainer({
          title: 'Event 1',
          description: 'Current user event',
          eventDate: addDays(new Date(), 1),
          maintainerId: currentUserId,
        })

        // Other maintainer creates event2 - current user doesn't participate
        const { eventId: event2Id } = await fixtures.insertEventWithMaintainer({
          title: 'Event 2',
          description: 'Other user event',
          eventDate: addDays(new Date(), 2),
          maintainerId: otherMaintainerId,
        })

        // user1 participates with current user in event1
        await fixtures.insertActiveAttendee({ eventId: event1Id, userId: user1Id })

        // user2 only participates in event2 (not with current user)
        await fixtures.insertActiveAttendee({ eventId: event2Id, userId: user2Id })

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
        await fixtures.insertEventWithMaintainer({
          title: 'Solo Event',
          description: 'Event with only current user',
          eventDate: addDays(new Date(), 1),
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
