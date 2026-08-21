import type { RequestApp } from '@wishlist/api-test-utils'

import { BASE_USER_EMAIL, Factories, Tables, useTestApp } from '@wishlist/api-test-utils'
import { SecretSantaStatus, uuid } from '@wishlist/common'

describe('SecretSantaController', () => {
  const { getRequest, getFactories, expectTable, expectMail } = useTestApp()
  let factories: Factories
  let request: RequestApp
  let currentUserId: string

  beforeEach(async () => {
    factories = getFactories()
    request = await getRequest({ signedAs: 'BASE_USER' })
    currentUserId = await factories.getSignedUserId('BASE_USER')
  })

  describe('GET /secret-santa', () => {
    const path = '/secret-santa'

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      const eventId = uuid()

      await unauthenticatedRequest.get(path).query({ eventId }).expect(401)
    })

    it('should return undefined when no secret santa exists for event', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      await request.get(path).query({ eventId }).expect(200).expect({})
    })

    it('should return secret santa when exists and current user is maintainer of event', async () => {
      const {
        event: { id: eventId },
        eventDate,
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        description: 'Secret Santa Description',
        budget: 50,
        status: SecretSantaStatus.CREATED,
      })

      await request
        .get(path)
        .query({ eventId })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            id: secretSantaId,
            event: {
              id: eventId,
              title: 'Test Event',
              description: 'Test Description',
              event_date: eventDate.toISODate(),
            },
            description: 'Secret Santa Description',
            budget: 50,
            status: SecretSantaStatus.CREATED,
            users: [],
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          })
        })
    })

    it('should return error when current user is not part of event', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      await factories.secretSanta.create({
        eventId,
        description: 'Secret Santa Description',
        budget: 50,
        status: SecretSantaStatus.CREATED,
      })

      await request.get(path).query({ eventId }).expect(403)
    })
  })

  describe('GET /secret-santa/user/draw', () => {
    const path = '/secret-santa/user/draw'

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()
      const eventId = uuid()

      await unauthenticatedRequest.get(path).query({ eventId }).expect(401)
    })

    it('should return undefined when secret santa is not started and user has no draw', async () => {
      const {
        event: { id: eventId },
        attendee: { id: attendeeId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId,
      })

      await request.get(path).query({ eventId }).expect(200).expect({})
    })

    it('should return draw when secret santa is started and user has a draw', async () => {
      const {
        event: { id: eventId },
        attendee: { id: attendeeId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: targetUserId } = await factories.user.create({
        email: 'target@test.fr',
        firstName: 'Target',
        lastName: 'User',
      })
      const { id: targetAttendeeId } = await factories.eventAttendee.create({
        eventId,
        userId: targetUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const { id: targetSecretSantaUserId } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: targetAttendeeId,
      })

      await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId,
        drawUserId: targetSecretSantaUserId,
      })

      await request
        .get(path)
        .query({ eventId })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            id: targetAttendeeId,
            role: 'user',
            user: {
              id: targetUserId,
              email: 'target@test.fr',
              firstname: 'Target',
              lastname: 'User',
            },
          })
        })
    })
  })

  describe('POST /secret-santa', () => {
    const path = '/secret-santa'

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest
        .post(path)
        .send({
          event_id: uuid(),
          description: 'Test Secret Santa',
          budget: 50,
        })
        .expect(401)
    })

    it('should create secret santa when user is event maintainer', async () => {
      const {
        event: { id: eventId },
        eventDate,
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      await request
        .post(path)
        .send({
          event_id: eventId,
          description: 'Test Secret Santa',
          budget: 50,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            id: expect.toBeString(),
            event: {
              id: eventId,
              title: 'Test Event',
              description: 'Test Description',
              event_date: eventDate.toISODate(),
            },
            description: 'Test Secret Santa',
            budget: 50,
            status: SecretSantaStatus.CREATED,
            users: [],
            created_at: expect.toBeDateString(),
            updated_at: expect.toBeDateString(),
          })
        })

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1).row(0).toEqual({
        id: expect.toBeString(),
        event_id: eventId,
        description: 'Test Secret Santa',
        budget: 50,
        status: SecretSantaStatus.CREATED,
        created_at: expect.toBeDate(),
        updated_at: expect.toBeDate(),
      })
    })

    it('should return error when user is not in event', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      await request
        .post(path)
        .send({
          event_id: eventId,
          description: 'Test Secret Santa',
          budget: 50,
        })
        .expect(403)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(0)
    })

    it('should return error when secret santa already exists for event', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await request
        .post(path)
        .send({
          event_id: eventId,
          description: 'Test Secret Santa',
          budget: 50,
        })
        .expect(409)
    })
  })

  describe('PATCH /secret-santa/:id', () => {
    const path = (id: string) => `/secret-santa/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest
        .patch(path(uuid()))
        .send({
          description: 'Updated Description',
          budget: 100,
        })
        .expect(401)
    })

    it('should update secret santa when user is maintainer', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        description: 'Original Description',
        budget: 50,
        status: SecretSantaStatus.CREATED,
      })

      await request
        .patch(path(secretSantaId))
        .send({
          description: 'Updated Description',
          budget: 100,
        })
        .expect(200)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        description: 'Updated Description',
        budget: 100,
      })
    })

    it('should return error when user is not maintainer', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await request
        .patch(path(secretSantaId))
        .send({
          description: 'Updated Description',
        })
        .expect(403)
    })

    it('should return error when secret santa is already started', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      await request
        .patch(path(secretSantaId))
        .send({
          description: 'Updated Description',
        })
        .expect(409)
    })
  })

  describe('DELETE /secret-santa/:id', () => {
    const path = (id: string) => `/secret-santa/${id}`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest.delete(path(uuid())).expect(401)
    })

    it('should delete secret santa when user is maintainer', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await request.delete(path(secretSantaId)).expect(200)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(0)
    })

    it('should return an error when secret santa is started', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      await request.delete(path(secretSantaId)).expect(403)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1)
    })

    it('should return error when user is not maintainer', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await request.delete(path(secretSantaId)).expect(403)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1)
    })
  })

  describe('POST /secret-santa/:id/start', () => {
    const path = (id: string) => `/secret-santa/${id}/start`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest.post(path(uuid())).expect(401)
    })

    it('should start secret santa when user is maintainer and minimum users are added', async () => {
      const {
        event: { id: eventId },
        attendee: { id: maintainerAttendeeId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const {
        attendee: { id: attendee2Id },
      } = await factories.user.createAndJoinEvent({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
        eventId,
      })
      const {
        attendee: { id: attendee3Id },
      } = await factories.user.createAndJoinEvent({
        email: 'user3@test.fr',
        firstName: 'User3',
        lastName: 'Test',
        eventId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await factories.secretSantaUser.create({ secretSantaId, attendeeId: maintainerAttendeeId })
      await factories.secretSantaUser.create({ secretSantaId, attendeeId: attendee2Id })
      await factories.secretSantaUser.create({ secretSantaId, attendeeId: attendee3Id })

      await request.post(path(secretSantaId)).expect(201)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: SecretSantaStatus.STARTED,
      })

      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(3)
        .hasSubject('[Wishlist] Votre tirage au sort secret santa')
        .hasReceivers(['user2@test.fr', 'user3@test.fr', BASE_USER_EMAIL])
    })

    it('should return an error when user is not the maintainer', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
        attendee: { id: maintainerAttendeeId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const {
        attendee: { id: attendee2Id },
      } = await factories.user.createAndJoinEvent({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
        eventId,
      })
      const {
        attendee: { id: attendee3Id },
      } = await factories.user.createAndJoinEvent({
        email: 'user3@test.fr',
        firstName: 'User3',
        lastName: 'Test',
        eventId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await factories.secretSantaUser.create({ secretSantaId, attendeeId: maintainerAttendeeId })
      await factories.secretSantaUser.create({ secretSantaId, attendeeId: attendee2Id })
      await factories.secretSantaUser.create({ secretSantaId, attendeeId: attendee3Id })

      await request.post(path(secretSantaId)).expect(403)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: SecretSantaStatus.CREATED,
      })
    })

    it('should return error when not enough users to start', async () => {
      const {
        event: { id: eventId },
        attendee: { id: attendeeId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await factories.secretSantaUser.create({ secretSantaId, attendeeId })

      await request.post(path(secretSantaId)).expect(400)
    })
  })

  describe('POST /secret-santa/:id/cancel', () => {
    const path = (id: string) => `/secret-santa/${id}/cancel`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest.post(path(uuid())).expect(401)
    })

    it('should cancel secret santa when user is maintainer', async () => {
      const {
        event: { id: eventId },
        attendee: { id: maintainerAttendeeId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const {
        attendee: { id: attendee2Id },
      } = await factories.user.createAndJoinEvent({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
        eventId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      await factories.secretSantaUser.create({ secretSantaId, attendeeId: maintainerAttendeeId })
      await factories.secretSantaUser.create({ secretSantaId, attendeeId: attendee2Id })

      await request.post(path(secretSantaId)).expect(201)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: SecretSantaStatus.CREATED,
      })

      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(1)
        .hasSubject("[Wishlist] Le secret santa viens d'être annulé")
        .hasReceivers([BASE_USER_EMAIL, 'user2@test.fr'])
    })

    it('should return an error when user is not the maintainer', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      await request.post(path(secretSantaId)).expect(403)

      await expectTable(Tables.SECRET_SANTA).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: SecretSantaStatus.STARTED,
      })
    })
  })

  describe('POST /secret-santa/:id/users', () => {
    const path = (id: string) => `/secret-santa/${id}/users`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest
        .post(path(uuid()))
        .send({
          attendee_ids: [uuid()],
        })
        .expect(401)
    })

    it('should add users to secret santa when user is maintainer', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await request
        .post(path(secretSantaId))
        .send({
          attendee_ids: [attendee2Id],
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({
            users: [
              {
                id: expect.toBeString(),
                attendee: {
                  id: attendee2Id,
                  role: 'user',
                  user: {
                    id: user2Id,
                    email: 'user2@test.fr',
                    firstname: 'User2',
                    lastname: 'Test',
                  },
                },
                exclusions: [],
              },
            ],
          })
        })

      await expectTable(Tables.SECRET_SANTA_USER).hasNumberOfRows(1).row(0).toEqual({
        id: expect.toBeString(),
        secret_santa_id: secretSantaId,
        attendee_id: attendee2Id,
        draw_user_id: null,
        exclusions: [],
        created_at: expect.toBeDate(),
        updated_at: expect.toBeDate(),
      })
    })

    it('should return an error when user is the maintainer but secret santa is started', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      await request
        .post(path(secretSantaId))
        .send({
          attendee_ids: [attendee2Id],
        })
        .expect(403)

      await expectTable(Tables.SECRET_SANTA_USER).hasNumberOfRows(0)
    })

    it('should return an error when user is not the maintainer', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await request
        .post(path(secretSantaId))
        .send({
          attendee_ids: [attendee2Id],
        })
        .expect(403)

      await expectTable(Tables.SECRET_SANTA_USER).hasNumberOfRows(0)
    })
  })

  describe('PUT /secret-santa/:id/user/:secretSantaUserId', () => {
    const path = (id: string, secretSantaUserId: string) => `/secret-santa/${id}/user/${secretSantaUserId}`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest
        .put(path(uuid(), uuid()))
        .send({
          exclusions: [],
        })
        .expect(401)
    })

    it('should update secret santa user exclusions when user is maintainer', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })
      const { id: user3Id } = await factories.user.create({
        email: 'user3@test.fr',
        firstName: 'User3',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })
      const { id: attendee3Id } = await factories.eventAttendee.create({ eventId, userId: user3Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const { id: secretSantaUser2Id } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee2Id,
      })
      const { id: secretSantaUser3Id } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee3Id,
      })

      await request
        .put(path(secretSantaId, secretSantaUser2Id))
        .send({
          exclusions: [secretSantaUser3Id],
        })
        .expect(200)

      await expectTable(Tables.SECRET_SANTA_USER)
        .row(0)
        .toMatchObject({
          id: secretSantaUser2Id,
          exclusions: [secretSantaUser3Id],
        })
    })

    it('should return an error when user is the maintainer but secret santa is started', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })
      const { id: user3Id } = await factories.user.create({
        email: 'user3@test.fr',
        firstName: 'User3',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })
      const { id: attendee3Id } = await factories.eventAttendee.create({ eventId, userId: user3Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const { id: secretSantaUser2Id } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee2Id,
      })
      const { id: secretSantaUser3Id } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee3Id,
      })

      await request
        .put(path(secretSantaId, secretSantaUser2Id))
        .send({
          exclusions: [secretSantaUser3Id],
        })
        .expect(403)

      await expectTable(Tables.SECRET_SANTA_USER).row(0).toMatchObject({
        id: secretSantaUser2Id,
        exclusions: [],
      })
    })

    it('should return an error when user is not the maintainer', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })
      const { id: user3Id } = await factories.user.create({
        email: 'user3@test.fr',
        firstName: 'User3',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })
      const { id: attendee3Id } = await factories.eventAttendee.create({ eventId, userId: user3Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const { id: secretSantaUser2Id } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee2Id,
      })
      const { id: secretSantaUser3Id } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee3Id,
      })

      await request
        .put(path(secretSantaId, secretSantaUser2Id))
        .send({
          exclusions: [secretSantaUser3Id],
        })
        .expect(403)

      await expectTable(Tables.SECRET_SANTA_USER).row(0).toMatchObject({
        id: secretSantaUser2Id,
        exclusions: [],
      })
    })
  })

  describe('DELETE /secret-santa/:id/user/:secretSantaUserId', () => {
    const path = (id: string, secretSantaUserId: string) => `/secret-santa/${id}/user/${secretSantaUserId}`

    it('should return unauthorized if not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      await unauthenticatedRequest.delete(path(uuid(), uuid())).expect(401)
    })

    it('should remove user from secret santa when user is maintainer and secret santa is not started', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const { id: secretSantaUserId } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee2Id,
      })

      await request.delete(path(secretSantaId, secretSantaUserId)).expect(200)

      await expectTable(Tables.SECRET_SANTA_USER).hasNumberOfRows(0)
    })

    it('should return error when secret santa is started and user is maintainer', async () => {
      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const { id: secretSantaUserId } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee2Id,
      })

      await request.delete(path(secretSantaId, secretSantaUserId)).expect(403)
    })

    it('should return error when user is not the maintainer', async () => {
      const { id: otherUserId } = await factories.user.create({
        email: 'other@test.fr',
        firstName: 'Other',
        lastName: 'User',
      })

      const {
        event: { id: eventId },
      } = await factories.event.createWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const { id: user2Id } = await factories.user.create({
        email: 'user2@test.fr',
        firstName: 'User2',
        lastName: 'Test',
      })

      const { id: attendee2Id } = await factories.eventAttendee.create({ eventId, userId: user2Id })

      const { id: secretSantaId } = await factories.secretSanta.create({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const { id: secretSantaUserId } = await factories.secretSantaUser.create({
        secretSantaId,
        attendeeId: attendee2Id,
      })

      await request.delete(path(secretSantaId, secretSantaUserId)).expect(403)
    })
  })
})
