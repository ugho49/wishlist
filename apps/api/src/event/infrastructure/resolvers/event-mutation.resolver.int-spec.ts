import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { uuid } from '@wishlist/common';
import { DateTime } from 'luxon';

import { SecretSantaStatus } from '../../../secret-santa/domain/secret-santa-status.enum';

/**
 * Integration tests for the GraphQL EventMutationResolver.
 *
 * GraphQL always returns HTTP 200; thrown exceptions are mapped by the
 * error transform plugin to typed rejections placed at data.<field>:
 *   @Args schema failure  -> ValidationRejection
 *   UnauthorizedException   -> UnauthorizedRejection
 *   NotFoundException       -> NotFoundRejection
 *   ForbiddenException      -> ForbiddenRejection
 *   other HttpException     -> InternalErrorRejection
 */
const GRAPHQL_PATH = '/graphql';

const futureDate = () => DateTime.now().plus({ days: 30 }).toISODate() as string;

describe('EventMutationResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable, expectMail, clearMails, fillRateLimit } = useTestApp();
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe('Mutation createEvent', () => {
    const mutation = /* GraphQL */ `
      mutation CreateEvent($input: CreateEventInput!) {
        createEvent(input: $input) {
          __typename
          ... on Event {
            id
            title
            description
            icon
            eventDate
            attendees {
              id
            }
          }
          ... on BusinessRuleRejection {
            code
          }
          ... on ValidationRejection {
            errors {
              field
              message
            }
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { input: { title: 'My Event', eventDate: futureDate() } } })
        .expect(200);

      expect(res.body.data?.createEvent?.__typename).not.toBe('Event');
      await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0);
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should create an event successfully (creator becomes maintainer attendee)', async () => {
        const eventDate = futureDate();
        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: {
              input: { title: 'Christmas', description: 'Family party', icon: '🎄', eventDate },
            },
          })
          .expect(200);

        expect(res.body.data.createEvent).toMatchObject({
          __typename: 'Event',
          id: expect.toBeString(),
          title: 'Christmas',
          description: 'Family party',
          icon: '🎄',
          eventDate,
        });
        // Creator is automatically added as a maintainer attendee.
        expect(res.body.data.createEvent.attendees).toHaveLength(1);

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: res.body.data.createEvent.id,
          title: 'Christmas',
          description: 'Family party',
          icon: '🎄',
        });

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          event_id: res.body.data.createEvent.id,
          user_id: currentUserId,
          role: 'creator',
        });
      });

      it('should create an event with an additional attendee', async () => {
        const eventDate = futureDate();
        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: {
              input: {
                title: 'New Year',
                eventDate,
                attendees: [{ email: 'invited@test.com', role: 'PARTICIPANT' }],
              },
            },
          })
          .expect(200);

        expect(res.body.data.createEvent.__typename).toBe('Event');
        expect(res.body.data.createEvent.attendees).toHaveLength(2);

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1);
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2);
      });

      it.each([
        { case: 'empty title', input: { title: '', eventDate: futureDate() }, field: 'title' },
        { case: 'title too long', input: { title: 'a'.repeat(101), eventDate: futureDate() }, field: 'title' },
        { case: 'invalid event date', input: { title: 'Event', eventDate: 'not-a-date' }, field: 'eventDate' },
        { case: 'invalid icon', input: { title: 'Event', eventDate: futureDate(), icon: 'abc' }, field: 'icon' },
        {
          case: 'invalid attendee email',
          input: { title: 'Event', eventDate: futureDate(), attendees: [{ email: 'not-an-email' }] },
          field: 'attendees',
        },
        {
          case: 'more than 100 attendees',
          input: {
            title: 'Event',
            eventDate: futureDate(),
            attendees: Array.from({ length: 101 }, (_, index) => ({ email: `invited${index}@test.com` })),
          },
          field: 'attendees',
        },
      ])('should return ValidationRejection when invalid input: $case', async ({ input, field }) => {
        const res = await request.post(GRAPHQL_PATH).send({ query: mutation, variables: { input } }).expect(200);

        expect(res.body.data.createEvent.__typename).toBe('ValidationRejection');
        expect(res.body.data.createEvent.errors).toEqual(
          expect.arrayContaining([expect.objectContaining({ field: expect.stringContaining(field) })]),
        );

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0);
      });

      it('should return BusinessRuleRejection RATE_LIMITED when the daily invitation quota is reached', async () => {
        await fillRateLimit(`invitation:user:${currentUserId}`, 100);

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { input: { title: 'Event', eventDate: futureDate(), attendees: [{ email: 'a@test.com' }] } },
          })
          .expect(200);

        expect(res.body.data.createEvent).toEqual({ __typename: 'BusinessRuleRejection', code: 'RATE_LIMITED' });
        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0);
      });
    });
  });

  describe('Mutation updateEvent', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateEvent($id: EventId!, $input: UpdateEventInput!) {
        updateEvent(id: $id, input: $input) {
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
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid(), input: { title: 'Updated', eventDate: futureDate() } } })
        .expect(200);

      expect(res.body.data?.updateEvent?.__typename).not.toBe('VoidOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should update an event the user maintains', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original',
          maintainerId: currentUserId,
        });

        const eventDate = futureDate();
        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { id: eventId, input: { title: 'Updated Title', description: 'New desc', eventDate } },
          })
          .expect(200);

        expect(res.body.data.updateEvent).toEqual({ __typename: 'VoidOutput', success: true });

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: eventId,
          title: 'Updated Title',
          description: 'New desc',
        });
      });

      it('should return ValidationRejection when title is empty', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original',
          maintainerId: currentUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId, input: { title: '', eventDate: futureDate() } } })
          .expect(200);

        expect(res.body.data.updateEvent.__typename).toBe('ValidationRejection');

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({ title: 'Original' });
      });

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid(), input: { title: 'Updated', eventDate: futureDate() } } })
          .expect(200);

        expect(res.body.data.updateEvent.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Original',
          maintainerId: otherUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId, input: { title: 'Hacked', eventDate: futureDate() } } })
          .expect(200);

        expect(res.body.data.updateEvent.__typename).toBe('UnauthorizedRejection');

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({ title: 'Original' });
      });
    });
  });

  describe('Mutation deleteEvent', () => {
    const mutation = /* GraphQL */ `
      mutation DeleteEvent($id: EventId!) {
        deleteEvent(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { id: uuid() } })
        .expect(200);

      expect(res.body.data?.deleteEvent?.__typename).not.toBe('VoidOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should delete an event the user maintains (no wishlists)', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'To Delete',
          maintainerId: currentUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId } })
          .expect(200);

        expect(res.body.data.deleteEvent).toEqual({ __typename: 'VoidOutput', success: true });

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0);
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(0);
      });

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: uuid() } })
          .expect(200);

        expect(res.body.data.deleteEvent.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { id: eventId } })
          .expect(200);

        expect(res.body.data.deleteEvent.__typename).toBe('UnauthorizedRejection');

        await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(1);
      });
    });
  });

  describe('Mutation addEventAttendee', () => {
    const mutation = /* GraphQL */ `
      mutation AddEventAttendee($eventId: EventId!, $input: AddEventAttendeeInput!) {
        addEventAttendee(eventId: $eventId, input: $input) {
          __typename
          ... on EventAttendee {
            id
            pendingEmail
            role
          }
          ... on BusinessRuleRejection {
            code
          }
          ... on ValidationRejection {
            errors {
              field
              message
            }
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { eventId: uuid(), input: { email: 'a@test.com' } } })
        .expect(200);

      expect(res.body.data?.addEventAttendee?.__typename).not.toBe('EventAttendee');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should add a pending attendee to an event the user maintains', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { eventId, input: { email: 'invited@test.com', role: 'PARTICIPANT' } },
          })
          .expect(200);

        expect(res.body.data.addEventAttendee).toMatchObject({
          __typename: 'EventAttendee',
          id: expect.toBeString(),
          pendingEmail: 'invited@test.com',
          role: 'PARTICIPANT',
        });

        // 1 maintainer + 1 new attendee
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2);
      });

      it('should return BusinessRuleRejection RATE_LIMITED when the daily invitation quota is reached', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });
        await fillRateLimit(`invitation:user:${currentUserId}`, 100);

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, input: { email: 'invited@test.com' } } })
          .expect(200);

        expect(res.body.data.addEventAttendee).toEqual({ __typename: 'BusinessRuleRejection', code: 'RATE_LIMITED' });
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1);
      });

      it('should return ValidationRejection when the email is invalid', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, input: { email: 'not-an-email' } } })
          .expect(200);

        expect(res.body.data.addEventAttendee.__typename).toBe('ValidationRejection');
        expect(res.body.data.addEventAttendee.errors).toEqual(
          expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
        );

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1);
      });

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId: uuid(), input: { email: 'invited@test.com' } } })
          .expect(200);

        expect(res.body.data.addEventAttendee.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, input: { email: 'invited@test.com' } } })
          .expect(200);

        expect(res.body.data.addEventAttendee.__typename).toBe('UnauthorizedRejection');

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1);
      });
    });
  });

  describe('Mutation removeEventAttendee', () => {
    const mutation = /* GraphQL */ `
      mutation RemoveEventAttendee($eventId: EventId!, $attendeeId: AttendeeId!) {
        removeEventAttendee(eventId: $eventId, attendeeId: $attendeeId) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on BusinessRuleRejection {
            code
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { eventId: uuid(), attendeeId: uuid() } })
        .expect(200);

      expect(res.body.data?.removeEventAttendee?.__typename).not.toBe('VoidOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should remove a pending attendee from an event the user maintains', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'pending@test.com',
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId } })
          .expect(200);

        expect(res.body.data.removeEventAttendee).toEqual({ __typename: 'VoidOutput', success: true });

        // Only the maintainer attendee remains
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          user_id: currentUserId,
          role: 'creator',
        });
      });

      it('should take the attendee out of a secret santa that has not been drawn yet', async () => {
        const { eventId, attendeeId: maintainerAttendeeId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });
        const attendeeId = await fixtures.insertPendingAttendee({ eventId, tempUserEmail: 'pending@test.com' });
        const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.CREATED });
        const attendeeSecretSantaUserId = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId });
        const maintainerSecretSantaUserId = await fixtures.insertSecretSantaUser({
          secretSantaId,
          attendeeId: maintainerAttendeeId,
          exclusions: [attendeeSecretSantaUserId],
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId } })
          .expect(200);

        expect(res.body.data.removeEventAttendee).toEqual({ __typename: 'VoidOutput', success: true });

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: maintainerAttendeeId,
        });
        await expectTable(Fixtures.SECRET_SANTA_TABLE).hasNumberOfRows(1);
        await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: maintainerSecretSantaUserId,
          exclusions: [],
        });
      });

      it('should return BusinessRuleRejection and keep the attendee when the secret santa draw has started', async () => {
        const { eventId, attendeeId: maintainerAttendeeId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });
        const attendeeId = await fixtures.insertPendingAttendee({ eventId, tempUserEmail: 'pending@test.com' });
        const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.STARTED });
        const attendeeSecretSantaUserId = await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId });
        await fixtures.insertSecretSantaUser({
          secretSantaId,
          attendeeId: maintainerAttendeeId,
          drawUserId: attendeeSecretSantaUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId } })
          .expect(200);

        expect(res.body.data.removeEventAttendee).toEqual({
          __typename: 'BusinessRuleRejection',
          code: 'USER_IN_STARTED_SECRET_SANTA',
        });

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2);
        await expectTable(Fixtures.SECRET_SANTA_USER_TABLE).hasNumberOfRows(2);
      });

      it('should return NotFoundRejection when the attendee does not exist on the event', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId: uuid() } })
          .expect(200);

        expect(res.body.data.removeEventAttendee.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when the user is not a maintainer', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        });

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'pending@test.com',
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId } })
          .expect(200);

        expect(res.body.data.removeEventAttendee.__typename).toBe('UnauthorizedRejection');

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2);
      });
    });
  });

  describe('Mutation updateEventAttendeeRole', () => {
    const mutation = /* GraphQL */ `
      mutation UpdateEventAttendeeRole($eventId: EventId!, $attendeeId: AttendeeId!, $role: AttendeeRole!) {
        updateEventAttendeeRole(eventId: $eventId, attendeeId: $attendeeId, role: $role) {
          __typename
          ... on VoidOutput {
            success
          }
          ... on UnauthorizedRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { eventId: uuid(), attendeeId: uuid(), role: 'ADMIN' } })
        .expect(200);

      expect(res.body.data?.updateEventAttendeeRole?.__typename).not.toBe('VoidOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it('should update an attendee role when the user is creator', async () => {
        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          maintainerId: currentUserId,
        });
        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'pending@test.com',
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId, role: 'ADMIN' } })
          .expect(200);

        expect(res.body.data.updateEventAttendeeRole).toEqual({ __typename: 'VoidOutput', success: true });

        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE).hasNumberOfRows(2).row(1).toMatchObject({
          id: attendeeId,
          role: 'admin',
        });
      });

      it('should return UnauthorizedRejection when the user is not a creator or admin', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Other Event',
          maintainerId: otherUserId,
        });

        const attendeeId = await fixtures.insertPendingAttendee({
          eventId,
          tempUserEmail: 'pending@test.com',
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeId, role: 'ADMIN' } })
          .expect(200);

        expect(res.body.data.updateEventAttendeeRole.__typename).toBe('UnauthorizedRejection');
      });
    });
  });

  describe('Mutation remindEventAttendees', () => {
    const mutation = /* GraphQL */ `
      mutation RemindEventAttendees($eventId: EventId!, $attendeeIds: [AttendeeId!]!) {
        remindEventAttendees(eventId: $eventId, attendeeIds: $attendeeIds) {
          __typename
          ... on RemindEventAttendeesOutput {
            remindedCount
          }
          ... on BusinessRuleRejection {
            code
          }
          ... on ValidationRejection {
            errors {
              field
              message
            }
          }
        }
      }
    `;

    const reminderSubject = "N'oubliez pas votre liste pour Christmas";

    it('should not succeed when not authenticated', async () => {
      const request = await getRequest();
      const res = await request
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { eventId: uuid(), attendeeIds: [uuid()] } })
        .expect(200);

      expect(res.body.data?.remindEventAttendees?.__typename).not.toBe('RemindEventAttendeesOutput');
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;
      let eventId: string;
      let lazyAttendeeId: string;
      let filledAttendeeId: string;
      let pendingAttendeeId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
        ({ eventId } = await fixtures.insertEventWithMaintainer({ title: 'Christmas', maintainerId: currentUserId }));
        ({ attendeeId: lazyAttendeeId } = await fixtures.insertUserAndAddItToEventAsAttendee({
          eventId,
          email: 'lazy@test.fr',
          firstname: 'Lazy',
          lastname: 'Attendee',
        }));
        const filled = await fixtures.insertUserAndAddItToEventAsAttendee({
          eventId,
          email: 'filled@test.fr',
          firstname: 'Filled',
          lastname: 'Attendee',
        });
        filledAttendeeId = filled.attendeeId;
        const wishlistId = await fixtures.insertWishlist({ eventIds: [eventId], userId: filled.userId, title: 'List' });
        await fixtures.insertItem({ wishlistId, name: 'Book' });
        pendingAttendeeId = await fixtures.insertPendingAttendee({ eventId, tempUserEmail: 'pending@test.fr' });
      });

      it.each([
        { name: 'no attendee', attendeeIds: [] },
        { name: 'more than 100 attendees', attendeeIds: Array.from({ length: 101 }, () => uuid()) },
      ])('should return ValidationRejection with $name', async ({ attendeeIds }) => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeIds } })
          .expect(200);

        expect(res.body.data.remindEventAttendees.__typename).toBe('ValidationRejection');
      });

      it('should return NotFoundRejection when the event does not exist', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId: uuid(), attendeeIds: [pendingAttendeeId] } })
          .expect(200);

        expect(res.body.data.remindEventAttendees.__typename).toBe('NotFoundRejection');
      });

      it('should return UnauthorizedRejection when the user is a simple participant', async () => {
        const { eventId: otherEventId } = await fixtures.insertEventWithMaintainer({
          title: 'Not mine',
          maintainerId: await fixtures.insertUser({ email: 'owner@test.fr', firstname: 'Event', lastname: 'Owner' }),
        });
        await fixtures.insertActiveAttendee({ eventId: otherEventId, userId: currentUserId });
        const otherPendingAttendeeId = await fixtures.insertPendingAttendee({
          eventId: otherEventId,
          tempUserEmail: 'other-pending@test.fr',
        });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId: otherEventId, attendeeIds: [otherPendingAttendeeId] } })
          .expect(200);

        expect(res.body.data.remindEventAttendees.__typename).toBe('UnauthorizedRejection');
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE, { last_reminded_at: 'ASC' })
          .row(0)
          .toMatchObject({ last_reminded_at: null });
      });

      it('should email the selected attendees without a filled wishlist and remember the reminder', async () => {
        await clearMails();

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: { eventId, attendeeIds: [lazyAttendeeId, filledAttendeeId, pendingAttendeeId] },
          })
          .expect(200);

        expect(res.body.data.remindEventAttendees).toEqual({
          __typename: 'RemindEventAttendeesOutput',
          remindedCount: 2,
        });
        // Reminded rows first (NULLs last), the pending attendee before the lazy user (temp email set first).
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE, { last_reminded_at: 'ASC', temp_user_email: 'ASC' })
          .hasNumberOfRows(4)
          .row(0)
          .toMatchObject({ id: pendingAttendeeId, last_reminded_at: expect.any(Date) })
          .row(1)
          .toMatchObject({ id: lazyAttendeeId, last_reminded_at: expect.any(Date) })
          .row(2)
          .toMatchObject({ last_reminded_at: null })
          .row(3)
          .toMatchObject({ last_reminded_at: null });
        await expectMail()
          .waitFor(500)
          .hasNumberOfEmails(2)
          .hasSubject(reminderSubject)
          .hasReceivers(['lazy@test.fr', 'pending@test.fr']);
      });

      it('should not remind the same attendees twice in a row', async () => {
        await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeIds: [lazyAttendeeId] } })
          .expect(200);

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeIds: [lazyAttendeeId] } })
          .expect(200);

        expect(res.body.data.remindEventAttendees).toEqual({
          __typename: 'RemindEventAttendeesOutput',
          remindedCount: 0,
        });
      });

      it('should return BusinessRuleRejection RATE_LIMITED when the daily invitation quota is reached', async () => {
        await fillRateLimit(`invitation:user:${currentUserId}`, 100);

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { eventId, attendeeIds: [lazyAttendeeId] } })
          .expect(200);

        expect(res.body.data.remindEventAttendees).toEqual({
          __typename: 'BusinessRuleRejection',
          code: 'RATE_LIMITED',
        });
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE, { last_reminded_at: 'ASC' })
          .row(0)
          .toMatchObject({ last_reminded_at: null });
      });
    });
  });
});
