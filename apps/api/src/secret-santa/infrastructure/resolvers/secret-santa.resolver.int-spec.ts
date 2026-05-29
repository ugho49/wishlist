import type { RequestApp } from '@wishlist/api-test-utils'

import { Fixtures, useTestApp } from '@wishlist/api-test-utils'
import { SecretSantaStatus, uuid } from '@wishlist/common'

const SUCCESS_TYPENAMES = ['SecretSanta', 'EventAttendee', 'VoidOutput', 'AddSecretSantaUsersOutput']

describe('SecretSantaResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable, expectMail } = useTestApp()
  let fixtures: Fixtures
  let request: RequestApp
  let currentUserId: string

  beforeEach(async () => {
    fixtures = getFixtures()
    request = await getRequest({ signedAs: 'BASE_USER' })
    currentUserId = await fixtures.getSignedUserId('BASE_USER')
  })

  // Asserts the operation did NOT return a success payload (rejection or top-level error)
  const expectNotSuccess = (res: { body: { data?: Record<string, unknown>; errors?: unknown[] } }, field: string) => {
    const payload = res.body.data?.[field] as { __typename?: string } | null | undefined
    const hasTopLevelError = Array.isArray(res.body.errors) && res.body.errors.length > 0
    const isSuccess = payload != null && SUCCESS_TYPENAMES.includes(payload.__typename ?? '')
    expect(hasTopLevelError || !isSuccess).toBe(true)
  }

  describe('Query getSecretSantaForEvent', () => {
    const query = /* GraphQL */ `
      query GetSecretSantaForEvent($eventId: EventId!) {
        getSecretSantaForEvent(eventId: $eventId) {
          __typename
          ... on SecretSanta {
            id
            eventId
            description
            budget
            status
            users {
              id
            }
            event {
              id
              title
              description
            }
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { eventId: uuid() } })
        .expect(200)

      expectNotSuccess(res, 'getSecretSantaForEvent')
    })

    it('should return null when no secret santa exists for event', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const res = await request.post('/graphql').send({ query, variables: { eventId } }).expect(200)

      expect(res.body.data.getSecretSantaForEvent).toBeNull()
    })

    it('should return secret santa with resolved event when current user is maintainer', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        description: 'Secret Santa Description',
        budget: 50,
        status: SecretSantaStatus.CREATED,
      })

      const res = await request.post('/graphql').send({ query, variables: { eventId } }).expect(200)

      expect(res.body.data.getSecretSantaForEvent).toMatchObject({
        __typename: 'SecretSanta',
        id: secretSantaId,
        eventId,
        description: 'Secret Santa Description',
        budget: 50,
        status: 'CREATED',
        users: [],
        event: {
          id: eventId,
          title: 'Test Event',
          description: 'Test Description',
        },
      })
    })

    it('should return ForbiddenRejection when current user is not part of event', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      await fixtures.insertSecretSanta({
        eventId,
        description: 'Secret Santa Description',
        budget: 50,
        status: SecretSantaStatus.CREATED,
      })

      const res = await request.post('/graphql').send({ query, variables: { eventId } }).expect(200)

      expect(res.body.data.getSecretSantaForEvent).toMatchObject({ __typename: 'ForbiddenRejection' })
    })
  })

  describe('Query getMySecretSantaDraw', () => {
    const query = /* GraphQL */ `
      query GetMySecretSantaDraw($eventId: EventId!) {
        getMySecretSantaDraw(eventId: $eventId) {
          __typename
          ... on EventAttendee {
            id
            role
            user {
              id
              email
              firstName
              lastName
            }
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { eventId: uuid() } })
        .expect(200)

      expectNotSuccess(res, 'getMySecretSantaDraw')
    })

    it('should return null when secret santa is not started and user has no draw', async () => {
      const { eventId, attendeeId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId })

      const res = await request.post('/graphql').send({ query, variables: { eventId } }).expect(200)

      expect(res.body.data.getMySecretSantaDraw).toBeNull()
    })

    it('should return draw with resolved attendee/user when started and user has a draw', async () => {
      const { eventId, attendeeId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const targetUserId = await fixtures.insertUser({
        email: 'target@test.fr',
        firstname: 'Target',
        lastname: 'User',
      })
      const targetAttendeeId = await fixtures.insertActiveAttendee({ eventId, userId: targetUserId })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const targetSecretSantaUserId = await fixtures.insertSecretSantaUser({
        secretSantaId,
        attendeeId: targetAttendeeId,
      })

      await fixtures.insertSecretSantaUser({
        secretSantaId,
        attendeeId,
        drawUserId: targetSecretSantaUserId,
      })

      const res = await request.post('/graphql').send({ query, variables: { eventId } }).expect(200)

      expect(res.body.data.getMySecretSantaDraw).toMatchObject({
        __typename: 'EventAttendee',
        id: targetAttendeeId,
        role: 'USER',
        user: {
          id: targetUserId,
          email: 'target@test.fr',
          firstName: 'Target',
          lastName: 'User',
        },
      })
    })
  })

  describe('Mutation createSecretSanta', () => {
    const query = /* GraphQL */ `
      mutation CreateSecretSanta($input: CreateSecretSantaInput!) {
        createSecretSanta(input: $input) {
          __typename
          ... on SecretSanta {
            id
            eventId
            description
            budget
            status
            users {
              id
            }
            event {
              id
              title
              description
            }
          }
          ... on ValidationRejection {
            errors {
              field
              message
            }
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { input: { eventId: uuid(), description: 'Test Secret Santa', budget: 50 } } })
        .expect(200)

      expectNotSuccess(res, 'createSecretSanta')
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(0)
    })

    it('should create secret santa with resolved event when user is event maintainer', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { eventId, description: 'Test Secret Santa', budget: 50 } } })
        .expect(200)

      expect(res.body.data.createSecretSanta).toMatchObject({
        __typename: 'SecretSanta',
        id: expect.toBeString(),
        eventId,
        description: 'Test Secret Santa',
        budget: 50,
        status: 'CREATED',
        users: [],
        event: {
          id: eventId,
          title: 'Test Event',
          description: 'Test Description',
        },
      })

      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toEqual({
        id: res.body.data.createSecretSanta.id,
        event_id: eventId,
        description: 'Test Secret Santa',
        budget: 50,
        status: 'created',
        created_at: expect.toBeDate(),
        updated_at: expect.toBeDate(),
      })
    })

    it.each([
      {
        case: 'missing eventId',
        input: { description: 'Test', budget: 50 },
      },
      {
        case: 'invalid eventId',
        input: { eventId: 'not-a-uuid', description: 'Test', budget: 50 },
      },
    ])('should not create secret santa when input is invalid: $case', async ({ input }) => {
      // A missing required field (eventId) is rejected by GraphQL variable coercion (HTTP 400)
      // before the resolver runs; an invalid-but-present scalar reaches the Zod pipe (HTTP 200).
      const res = await request.post('/graphql').send({ query, variables: { input } })

      expectNotSuccess(res, 'createSecretSanta')
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(0)
    })

    it('should return ForbiddenRejection and not change db when user is not in event', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { eventId, description: 'Test Secret Santa', budget: 50 } } })
        .expect(200)

      expect(res.body.data.createSecretSanta).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(0)
    })

    it('should not succeed when secret santa already exists for event', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.CREATED })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { input: { eventId, description: 'Test Secret Santa', budget: 50 } } })
        .expect(200)

      expectNotSuccess(res, 'createSecretSanta')
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1)
    })
  })

  describe('Mutation updateSecretSanta', () => {
    const query = /* GraphQL */ `
      mutation UpdateSecretSanta($id: SecretSantaId!, $input: UpdateSecretSantaInput!) {
        updateSecretSanta(id: $id, input: $input) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { id: uuid(), input: { description: 'Updated', budget: 100 } } })
        .expect(200)

      expectNotSuccess(res, 'updateSecretSanta')
    })

    it('should update secret santa when user is maintainer', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        description: 'Original Description',
        budget: 50,
        status: SecretSantaStatus.CREATED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, input: { description: 'Updated Description', budget: 100 } } })
        .expect(200)

      expect(res.body.data.updateSecretSanta).toMatchObject({ __typename: 'VoidOutput', success: true })

      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        description: 'Updated Description',
        budget: 100,
      })
    })

    it('should return ForbiddenRejection and not change db when user is not maintainer', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        description: 'Original Description',
        status: SecretSantaStatus.CREATED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, input: { description: 'Updated Description' } } })
        .expect(200)

      expect(res.body.data.updateSecretSanta).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        description: 'Original Description',
      })
    })

    it('should not succeed when secret santa is already started', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, input: { description: 'Updated Description' } } })
        .expect(200)

      expectNotSuccess(res, 'updateSecretSanta')
    })
  })

  describe('Mutation deleteSecretSanta', () => {
    const query = /* GraphQL */ `
      mutation DeleteSecretSanta($id: SecretSantaId!) {
        deleteSecretSanta(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { id: uuid() } })
        .expect(200)

      expectNotSuccess(res, 'deleteSecretSanta')
    })

    it('should delete secret santa when user is maintainer', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expect(res.body.data.deleteSecretSanta).toMatchObject({ __typename: 'VoidOutput', success: true })
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(0)
    })

    it('should not succeed and not change db when secret santa is started', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expectNotSuccess(res, 'deleteSecretSanta')
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1)
    })

    it('should return ForbiddenRejection and not change db when user is not maintainer', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expect(res.body.data.deleteSecretSanta).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1)
    })
  })

  describe('Mutation startSecretSanta', () => {
    const query = /* GraphQL */ `
      mutation StartSecretSanta($id: SecretSantaId!) {
        startSecretSanta(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ValidationRejection {
            errors {
              field
              message
            }
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { id: uuid() } })
        .expect(200)

      expectNotSuccess(res, 'startSecretSanta')
    })

    it('should start secret santa and send emails when user is maintainer and min users added', async () => {
      const { eventId, attendeeId: maintainerAttendeeId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { attendeeId: attendee2Id } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'user2@test.fr',
        firstname: 'User2',
        lastname: 'Test',
        eventId,
      })
      const { attendeeId: attendee3Id } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'user3@test.fr',
        firstname: 'User3',
        lastname: 'Test',
        eventId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: maintainerAttendeeId })
      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })
      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee3Id })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expect(res.body.data.startSecretSanta).toMatchObject({ __typename: 'VoidOutput', success: true })

      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: 'started',
      })

      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(3)
        .hasSubject('[Wishlist] Votre tirage au sort secret santa')
        .hasReceivers(['user2@test.fr', 'user3@test.fr', Fixtures.BASE_USER_EMAIL])
    })

    it('should return ForbiddenRejection and not change db when user is not maintainer', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId, attendeeId: maintainerAttendeeId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const { attendeeId: attendee2Id } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'user2@test.fr',
        firstname: 'User2',
        lastname: 'Test',
        eventId,
      })
      const { attendeeId: attendee3Id } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'user3@test.fr',
        firstname: 'User3',
        lastname: 'Test',
        eventId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: maintainerAttendeeId })
      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })
      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee3Id })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expect(res.body.data.startSecretSanta).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: 'created',
      })
    })

    it('should not succeed and not change db when not enough users to start', async () => {
      const { eventId, attendeeId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expectNotSuccess(res, 'startSecretSanta')
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: 'created',
      })
    })
  })

  describe('Mutation cancelSecretSanta', () => {
    const query = /* GraphQL */ `
      mutation CancelSecretSanta($id: SecretSantaId!) {
        cancelSecretSanta(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { id: uuid() } })
        .expect(200)

      expectNotSuccess(res, 'cancelSecretSanta')
    })

    it('should cancel secret santa and send emails when user is maintainer', async () => {
      const { eventId, attendeeId: maintainerAttendeeId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const { attendeeId: attendee2Id } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'user2@test.fr',
        firstname: 'User2',
        lastname: 'Test',
        eventId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: maintainerAttendeeId })
      await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expect(res.body.data.cancelSecretSanta).toMatchObject({ __typename: 'VoidOutput', success: true })

      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: 'created',
      })

      await expectMail()
        .waitFor(500)
        .hasNumberOfEmails(1)
        .hasSubject("[Wishlist] Le secret santa viens d'être annulé")
        .hasReceivers([Fixtures.BASE_USER_EMAIL, 'user2@test.fr'])
    })

    it('should return ForbiddenRejection and not change db when user is not maintainer', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId } })
        .expect(200)

      expect(res.body.data.cancelSecretSanta).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id: secretSantaId,
        status: 'started',
      })
    })
  })

  describe('Mutation addSecretSantaUsers', () => {
    const query = /* GraphQL */ `
      mutation AddSecretSantaUsers($id: SecretSantaId!, $input: AddSecretSantaUsersInput!) {
        addSecretSantaUsers(id: $id, input: $input) {
          __typename
          ... on AddSecretSantaUsersOutput {
            users {
              id
              attendeeId
              exclusions
              attendee {
                id
                role
                user {
                  id
                  email
                  firstName
                  lastName
                }
              }
            }
          }
          ... on ValidationRejection {
            errors {
              field
              message
            }
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { id: uuid(), input: { attendeeIds: [uuid()] } } })
        .expect(200)

      expectNotSuccess(res, 'addSecretSantaUsers')
    })

    it('should add users with resolved attendee when user is maintainer', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const user2Id = await fixtures.insertUser({
        email: 'user2@test.fr',
        firstname: 'User2',
        lastname: 'Test',
      })
      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, input: { attendeeIds: [attendee2Id] } } })
        .expect(200)

      expect(res.body.data.addSecretSantaUsers).toMatchObject({
        __typename: 'AddSecretSantaUsersOutput',
        users: [
          {
            id: expect.toBeString(),
            attendeeId: attendee2Id,
            exclusions: [],
            attendee: {
              id: attendee2Id,
              role: 'USER',
              user: {
                id: user2Id,
                email: 'user2@test.fr',
                firstName: 'User2',
                lastName: 'Test',
              },
            },
          },
        ],
      })

      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(1).row(0).toEqual({
        id: res.body.data.addSecretSantaUsers.users[0].id,
        secret_santa_id: secretSantaId,
        attendee_id: attendee2Id,
        draw_user_id: null,
        exclusions: [],
        created_at: expect.toBeDate(),
        updated_at: expect.toBeDate(),
      })
    })

    it('should not succeed and not change db when secret santa is started', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const user2Id = await fixtures.insertUser({
        email: 'user2@test.fr',
        firstname: 'User2',
        lastname: 'Test',
      })
      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.STARTED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, input: { attendeeIds: [attendee2Id] } } })
        .expect(200)

      expectNotSuccess(res, 'addSecretSantaUsers')
      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(0)
    })

    it('should return ForbiddenRejection and not change db when user is not maintainer', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const user2Id = await fixtures.insertUser({
        email: 'user2@test.fr',
        firstname: 'User2',
        lastname: 'Test',
      })
      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })

      const secretSantaId = await fixtures.insertSecretSanta({
        eventId,
        status: SecretSantaStatus.CREATED,
      })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, input: { attendeeIds: [attendee2Id] } } })
        .expect(200)

      expect(res.body.data.addSecretSantaUsers).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(0)
    })
  })

  describe('Mutation updateSecretSantaUser', () => {
    const query = /* GraphQL */ `
      mutation UpdateSecretSantaUser(
        $id: SecretSantaId!
        $secretSantaUserId: SecretSantaUserId!
        $input: UpdateSecretSantaUserInput!
      ) {
        updateSecretSantaUser(id: $id, secretSantaUserId: $secretSantaUserId, input: $input) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { id: uuid(), secretSantaUserId: uuid(), input: { exclusions: [] } } })
        .expect(200)

      expectNotSuccess(res, 'updateSecretSantaUser')
    })

    it('should update exclusions when user is maintainer', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const user2Id = await fixtures.insertUser({ email: 'user2@test.fr', firstname: 'User2', lastname: 'Test' })
      const user3Id = await fixtures.insertUser({ email: 'user3@test.fr', firstname: 'User3', lastname: 'Test' })

      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })
      const attendee3Id = await fixtures.insertActiveAttendee({ eventId, userId: user3Id })

      const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.CREATED })

      const secretSantaUser2Id = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })
      const secretSantaUser3Id = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee3Id })

      const res = await request
        .post('/graphql')
        .send({
          query,
          variables: {
            id: secretSantaId,
            secretSantaUserId: secretSantaUser2Id,
            input: { exclusions: [secretSantaUser3Id] },
          },
        })
        .expect(200)

      expect(res.body.data.updateSecretSantaUser).toMatchObject({ __typename: 'VoidOutput', success: true })

      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE)
        .row(0)
        .toMatchObject({
          id: secretSantaUser2Id,
          exclusions: [secretSantaUser3Id],
        })
    })

    it('should not succeed and not change db when secret santa is started', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const user2Id = await fixtures.insertUser({ email: 'user2@test.fr', firstname: 'User2', lastname: 'Test' })
      const user3Id = await fixtures.insertUser({ email: 'user3@test.fr', firstname: 'User3', lastname: 'Test' })

      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })
      const attendee3Id = await fixtures.insertActiveAttendee({ eventId, userId: user3Id })

      const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.STARTED })

      const secretSantaUser2Id = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })
      const secretSantaUser3Id = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee3Id })

      const res = await request
        .post('/graphql')
        .send({
          query,
          variables: {
            id: secretSantaId,
            secretSantaUserId: secretSantaUser2Id,
            input: { exclusions: [secretSantaUser3Id] },
          },
        })
        .expect(200)

      expectNotSuccess(res, 'updateSecretSantaUser')
      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).row(0).toMatchObject({
        id: secretSantaUser2Id,
        exclusions: [],
      })
    })

    it('should return ForbiddenRejection and not change db when user is not maintainer', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const user2Id = await fixtures.insertUser({ email: 'user2@test.fr', firstname: 'User2', lastname: 'Test' })
      const user3Id = await fixtures.insertUser({ email: 'user3@test.fr', firstname: 'User3', lastname: 'Test' })

      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })
      const attendee3Id = await fixtures.insertActiveAttendee({ eventId, userId: user3Id })

      const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.CREATED })

      const secretSantaUser2Id = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })
      const secretSantaUser3Id = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee3Id })

      const res = await request
        .post('/graphql')
        .send({
          query,
          variables: {
            id: secretSantaId,
            secretSantaUserId: secretSantaUser2Id,
            input: { exclusions: [secretSantaUser3Id] },
          },
        })
        .expect(200)

      expect(res.body.data.updateSecretSantaUser).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).row(0).toMatchObject({
        id: secretSantaUser2Id,
        exclusions: [],
      })
    })
  })

  describe('Mutation deleteSecretSantaUser', () => {
    const query = /* GraphQL */ `
      mutation DeleteSecretSantaUser($id: SecretSantaId!, $secretSantaUserId: SecretSantaUserId!) {
        deleteSecretSantaUser(id: $id, secretSantaUserId: $secretSantaUserId) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on ForbiddenRejection {
            message
          }
        }
      }
    `

    it('should not succeed when not authenticated', async () => {
      const unauthenticatedRequest = await getRequest()

      const res = await unauthenticatedRequest
        .post('/graphql')
        .send({ query, variables: { id: uuid(), secretSantaUserId: uuid() } })
        .expect(200)

      expectNotSuccess(res, 'deleteSecretSantaUser')
    })

    it('should remove user when user is maintainer and secret santa is not started', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const user2Id = await fixtures.insertUser({ email: 'user2@test.fr', firstname: 'User2', lastname: 'Test' })
      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })

      const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.CREATED })

      const secretSantaUserId = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, secretSantaUserId } })
        .expect(200)

      expect(res.body.data.deleteSecretSantaUser).toMatchObject({ __typename: 'VoidOutput', success: true })
      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(0)
    })

    it('should not succeed and not change db when secret santa is started', async () => {
      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: currentUserId,
      })

      const user2Id = await fixtures.insertUser({ email: 'user2@test.fr', firstname: 'User2', lastname: 'Test' })
      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })

      const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.STARTED })

      const secretSantaUserId = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, secretSantaUserId } })
        .expect(200)

      expectNotSuccess(res, 'deleteSecretSantaUser')
      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(1)
    })

    it('should return ForbiddenRejection and not change db when user is not maintainer', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other@test.fr',
        firstname: 'Other',
        lastname: 'User',
      })

      const { eventId } = await fixtures.insertEventWithMaintainer({
        title: 'Test Event',
        description: 'Test Description',
        maintainerId: otherUserId,
      })

      const user2Id = await fixtures.insertUser({ email: 'user2@test.fr', firstname: 'User2', lastname: 'Test' })
      const attendee2Id = await fixtures.insertActiveAttendee({ eventId, userId: user2Id })

      const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.CREATED })

      const secretSantaUserId = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: attendee2Id })

      const res = await request
        .post('/graphql')
        .send({ query, variables: { id: secretSantaId, secretSantaUserId } })
        .expect(200)

      expect(res.body.data.deleteSecretSantaUser).toMatchObject({ __typename: 'ForbiddenRejection' })
      await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(1)
    })
  })
})
