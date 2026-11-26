import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { uuid } from '@wishlist/common';

import { SecretSantaStatus } from '../../../secret-santa/domain/secret-santa-status.enum';

const GRAPHQL_PATH = '/graphql';

const KEEP_TARGET_PROFILE = {
  email: 'TARGET',
  firstName: 'TARGET',
  lastName: 'TARGET',
  birthday: 'TARGET',
  picture: 'TARGET',
};

describe('UserMergeAdminResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp();
  let fixtures: Fixtures;
  let request: RequestApp;
  let sourceUserId: string;
  let targetUserId: string;

  beforeEach(async () => {
    fixtures = getFixtures();
    sourceUserId = await fixtures.insertUser({ email: 'jean@gmail.com', firstname: 'Jeannot', lastname: 'D' });
    targetUserId = await fixtures.insertUser({ email: 'jean@work.fr', firstname: 'Jean', lastname: 'Dupont' });
  });

  describe('Query adminUserMergePreview', () => {
    const query = /* GraphQL */ `
      query AdminUserMergePreview($sourceUserId: UserId!, $targetUserId: UserId!) {
        adminUserMergePreview(sourceUserId: $sourceUserId, targetUserId: $targetUserId) {
          __typename
          ... on AdminUserMergePreview {
            source {
              user {
                id
                email
                accounts {
                  provider
                }
              }
              events {
                id
                title
                role
                inSecretSanta
              }
              wishlists {
                id
                title
                isCoOwner
                eventIds
                itemCount
              }
              reservedItemCount
            }
            target {
              user {
                id
              }
              events {
                id
              }
              wishlists {
                id
              }
              reservedItemCount
            }
          }
          ... on NotFoundRejection {
            message
          }
        }
      }
    `;

    it('should not succeed when unauthenticated', async () => {
      const unauthenticatedRequest = await getRequest();

      const res = await unauthenticatedRequest
        .post(GRAPHQL_PATH)
        .send({ query, variables: { sourceUserId, targetUserId } })
        .expect(200);

      expect(res.body.data?.adminUserMergePreview?.__typename).not.toBe('AdminUserMergePreview');
    });

    it('should reject a BASE_USER with ForbiddenRejection', async () => {
      const baseRequest = await getRequest({ signedAs: 'BASE_USER' });

      const res = await baseRequest
        .post(GRAPHQL_PATH)
        .send({ query, variables: { sourceUserId, targetUserId } })
        .expect(200);

      expect(res.body.data.adminUserMergePreview).toMatchObject({ __typename: 'ForbiddenRejection' });
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
      });

      it('should return NotFoundRejection for an unknown user', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { sourceUserId: uuid(), targetUserId } })
          .expect(200);

        expect(res.body.data.adminUserMergePreview).toMatchObject({ __typename: 'NotFoundRejection' });
      });

      it('should return what each user brings to the merge', async () => {
        const adminUserId = await fixtures.getSignedUserId('ADMIN_USER');
        const { eventId, attendeeId } = await fixtures.insertEventWithCreator({
          title: 'Noël',
          creatorId: sourceUserId,
        });
        const secretSantaId = await fixtures.insertSecretSanta({ eventId, status: SecretSantaStatus.CREATED });
        await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId });
        const ownedWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: sourceUserId,
          title: 'Liste de Jean',
        });
        await fixtures.insertItem({ wishlistId: ownedWishlistId, name: 'Livre' });
        const adminWishlistId = await fixtures.insertWishlist({
          eventIds: [eventId],
          userId: adminUserId,
          title: "Liste d'admin",
          coOwnerId: sourceUserId,
        });
        await fixtures.insertItem({ wishlistId: adminWishlistId, name: 'Vélo', takerId: sourceUserId });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query, variables: { sourceUserId, targetUserId } })
          .expect(200);

        const preview = res.body.data.adminUserMergePreview;
        expect(preview.__typename).toBe('AdminUserMergePreview');
        expect(preview.source.user).toEqual({
          id: sourceUserId,
          email: 'jean@gmail.com',
          accounts: [{ provider: 'PASSWORD' }],
        });
        expect(preview.source.events).toEqual([{ id: eventId, title: 'Noël', role: 'CREATOR', inSecretSanta: true }]);
        expect(preview.source.wishlists).toHaveLength(2);
        expect(preview.source.wishlists).toEqual(
          expect.arrayContaining([
            { id: ownedWishlistId, title: 'Liste de Jean', isCoOwner: false, eventIds: [eventId], itemCount: 1 },
            { id: adminWishlistId, title: "Liste d'admin", isCoOwner: true, eventIds: [eventId], itemCount: 1 },
          ]),
        );
        expect(preview.source.reservedItemCount).toBe(1);
        expect(preview.target).toEqual({
          user: { id: targetUserId },
          events: [],
          wishlists: [],
          reservedItemCount: 0,
        });
      });
    });
  });

  describe('Mutation adminMergeUsers', () => {
    const mutation = /* GraphQL */ `
      mutation AdminMergeUsers($input: AdminMergeUsersInput!) {
        adminMergeUsers(input: $input) {
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
          ... on BusinessRuleRejection {
            code
            message
          }
          ... on NotFoundRejection {
            message
          }
        }
      }
    `;

    const mergeInput = (overrides: Record<string, unknown> = {}) => ({
      sourceUserId,
      targetUserId,
      profile: KEEP_TARGET_PROFILE,
      accountIds: [],
      eventIds: [],
      wishlistIds: [],
      transferReservations: false,
      ...overrides,
    });

    it('should not succeed when unauthenticated', async () => {
      const unauthenticatedRequest = await getRequest();

      const res = await unauthenticatedRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { input: mergeInput() } })
        .expect(200);

      expect(res.body.data?.adminMergeUsers?.__typename).not.toBe('VoidOutput');
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(2);
    });

    it('should reject a BASE_USER with ForbiddenRejection and keep both users', async () => {
      const baseRequest = await getRequest({ signedAs: 'BASE_USER' });

      const res = await baseRequest
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { input: mergeInput() } })
        .expect(200);

      expect(res.body.data.adminMergeUsers).toMatchObject({ __typename: 'ForbiddenRejection' });
      // BASE_USER (signed) + source + target
      await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(3);
    });

    describe('when user is authenticated as ADMIN_USER', () => {
      let adminUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'ADMIN_USER' });
        adminUserId = await fixtures.getSignedUserId('ADMIN_USER');
      });

      it.each([
        { name: 'an invalid source id', overrides: { sourceUserId: 'not-a-uuid' } },
        { name: 'the same user twice', overrides: { targetUserId: 'same' } },
        { name: 'an invalid event id', overrides: { eventIds: ['not-a-uuid'] } },
      ])('should return ValidationRejection for $name', async ({ overrides }) => {
        const input = mergeInput(overrides);
        if (input.targetUserId === 'same') input.targetUserId = sourceUserId;

        const res = await request.post(GRAPHQL_PATH).send({ query: mutation, variables: { input } }).expect(200);

        expect(res.body.data.adminMergeUsers.__typename).toBe('ValidationRejection');
        // ADMIN_USER + source + target
        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(3);
      });

      it('should return NotFoundRejection for an unknown user', async () => {
        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { input: mergeInput({ sourceUserId: uuid() }) } })
          .expect(200);

        expect(res.body.data.adminMergeUsers).toMatchObject({ __typename: 'NotFoundRejection' });
        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(3);
      });

      it('should return BusinessRuleRejection and change nothing when the selection breaks a rule', async () => {
        await fixtures.insertEventWithCreator({ title: 'Anniversaire', creatorId: sourceUserId });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { input: mergeInput() } })
          .expect(200);

        expect(res.body.data.adminMergeUsers).toMatchObject({
          __typename: 'BusinessRuleRejection',
          code: 'INVALID_USER_MERGE',
        });
        await expectTable(Fixtures.USER_TABLE).hasNumberOfRows(3);
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({ user_id: sourceUserId, role: 'creator' });
      });

      it('should give the friends of the merged user to the kept one, the kept decisions winning', async () => {
        const xId = await fixtures.insertUser({ email: 'x@test.fr', firstname: 'X', lastname: 'Test' });
        const yId = await fixtures.insertUser({ email: 'y@test.fr', firstname: 'Y', lastname: 'Test' });
        const zId = await fixtures.insertUser({ email: 'z@test.fr', firstname: 'Z', lastname: 'Test' });
        // Decisions of the merged user: X added (the kept user hid X), Y added, the kept user added
        await fixtures.insertUserContact({ ownerUserId: sourceUserId, contactUserId: xId, status: 'added' });
        await fixtures.insertUserContact({ ownerUserId: sourceUserId, contactUserId: yId, status: 'added' });
        await fixtures.insertUserContact({ ownerUserId: sourceUserId, contactUserId: targetUserId, status: 'added' });
        await fixtures.insertUserContact({ ownerUserId: targetUserId, contactUserId: xId, status: 'hidden' });
        // Decisions about the merged user: Z added them, the kept user hid them
        await fixtures.insertUserContact({ ownerUserId: zId, contactUserId: sourceUserId, status: 'added' });
        await fixtures.insertUserContact({ ownerUserId: targetUserId, contactUserId: sourceUserId, status: 'hidden' });

        const res = await request
          .post(GRAPHQL_PATH)
          .send({ query: mutation, variables: { input: mergeInput() } })
          .expect(200);

        expect(res.body.data.adminMergeUsers.__typename).toBe('VoidOutput');
        await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(3);
        // Sorted by status ('added' first), then by owner id (uuid order is the hex string order)
        const added = [
          { owner_user_id: targetUserId, contact_user_id: yId, status: 'added' },
          { owner_user_id: zId, contact_user_id: targetUserId, status: 'added' },
        ].sort((a, b) => (a.owner_user_id < b.owner_user_id ? -1 : 1));
        const expected = [...added, { owner_user_id: targetUserId, contact_user_id: xId, status: 'hidden' }];
        for (const [index, row] of expected.entries()) {
          await expectTable(Fixtures.USER_CONTACT_TABLE, { status: 'ASC', owner_user_id: 'ASC' })
            .row(index)
            .toMatchObject(row);
        }
      });

      it('should move the selection to the kept user and delete the merged one', async () => {
        // Shared event: the source created it and takes part in its secret santa
        const shared = await fixtures.insertEventWithCreator({ title: 'Noël', creatorId: sourceUserId });
        const targetSharedAttendeeId = await fixtures.insertActiveAttendee({
          eventId: shared.eventId,
          userId: targetUserId,
        });
        const secretSantaId = await fixtures.insertSecretSanta({
          eventId: shared.eventId,
          status: SecretSantaStatus.CREATED,
        });
        await fixtures.insertSecretSantaUser({ secretSantaId, attendeeId: shared.attendeeId });

        // Source-only events: one kept, one left behind
        const keptEventId = await fixtures.insertEvent({ title: 'Anniversaire', eventDate: new Date('2027-03-01') });
        await fixtures.insertActiveAttendee({ eventId: keptEventId, userId: sourceUserId });
        const leftEventId = await fixtures.insertEvent({ title: 'Pot de départ', eventDate: new Date('2027-04-01') });
        await fixtures.insertActiveAttendee({ eventId: leftEventId, userId: sourceUserId });
        await fixtures.insertActiveAttendee({ eventId: leftEventId, userId: adminUserId });

        // Wishlists: an owned one co-owned by the target, a dropped one, one co-owned with the admin
        const ownedWishlistId = await fixtures.insertWishlist({
          eventIds: [keptEventId, shared.eventId],
          userId: sourceUserId,
          coOwnerId: targetUserId,
          title: 'A - liste de Jean',
        });
        const droppedWishlistId = await fixtures.insertWishlist({
          eventIds: [leftEventId],
          userId: sourceUserId,
          title: 'C - vieille liste',
        });
        await fixtures.insertItem({ wishlistId: droppedWishlistId, name: 'Vieux truc' });
        const coOwnedWishlistId = await fixtures.insertWishlist({
          eventIds: [shared.eventId],
          userId: adminUserId,
          coOwnerId: sourceUserId,
          title: "B - liste d'admin",
        });

        // Reservations: one only by the source, one by both users
        await fixtures.insertItem({
          wishlistId: coOwnedWishlistId,
          name: 'Vélo',
          takerId: sourceUserId,
        });
        const bothItemId = await fixtures.insertItem({
          wishlistId: coOwnedWishlistId,
          name: 'Livre',
          takerId: sourceUserId,
        });
        await fixtures.insertItemTaker({ itemId: bothItemId, userId: targetUserId });

        const accounts = await request
          .post(GRAPHQL_PATH)
          .send({
            query: /* GraphQL */ `
              query ($userId: UserId!) {
                adminUser(userId: $userId) {
                  ... on UserFull {
                    accounts {
                      id
                    }
                  }
                }
              }
            `,
            variables: { userId: sourceUserId },
          })
          .expect(200);
        const sourcePasswordAccountId = accounts.body.data.adminUser.accounts[0].id;

        const res = await request
          .post(GRAPHQL_PATH)
          .send({
            query: mutation,
            variables: {
              input: mergeInput({
                profile: { ...KEEP_TARGET_PROFILE, email: 'SOURCE' },
                accountIds: [sourcePasswordAccountId],
                eventIds: [keptEventId],
                wishlistIds: [ownedWishlistId, coOwnedWishlistId],
                transferReservations: true,
              }),
            },
          })
          .expect(200);

        expect(res.body.data.adminMergeUsers).toEqual({ __typename: 'VoidOutput', success: true });

        await expectTable(Fixtures.USER_TABLE, { email: 'ASC' })
          .hasNumberOfRows(2)
          .row(1)
          .toMatchObject({ id: targetUserId, email: 'jean@gmail.com', first_name: 'Jean', last_name: 'Dupont' });

        // The source password account replaced the target one
        await expectTable(Fixtures.USER_ACCOUNT_TABLE, { email: 'ASC' })
          .hasNumberOfRows(2)
          .row(1)
          .toMatchObject({ id: sourcePasswordAccountId, user_id: targetUserId, provider: 'password' });

        // Shared event: the target took the creator role; kept event moved; left event only keeps the admin
        await expectTable(Fixtures.EVENT_ATTENDEE_TABLE, { event_id: 'ASC', role: 'ASC' }).hasNumberOfRows(3).check();
        await expectTable(`${Fixtures.EVENT_ATTENDEE_TABLE} WHERE user_id = '${targetUserId}'`, { role: 'ASC' })
          .hasNumberOfRows(2)
          .row(0)
          .toMatchObject({ id: targetSharedAttendeeId, event_id: shared.eventId, role: 'creator' })
          .row(1)
          .toMatchObject({ event_id: keptEventId, role: 'participant' });

        await expectTable(Fixtures.SECRET_SANTA_USER_TABLE)
          .hasNumberOfRows(1)
          .row(0)
          .toMatchObject({ attendee_id: targetSharedAttendeeId });

        await expectTable(Fixtures.WISHLIST_TABLE, { title: 'ASC' })
          .hasNumberOfRows(2)
          .row(0)
          .toMatchObject({ id: ownedWishlistId, owner_id: targetUserId, co_owner_id: null })
          .row(1)
          .toMatchObject({ id: coOwnedWishlistId, owner_id: adminUserId, co_owner_id: targetUserId });
        await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(2);

        await expectTable(Fixtures.ITEM_TAKER_TABLE, { item_id: 'ASC' })
          .hasNumberOfRows(2)
          .row(0)
          .toMatchObject({ user_id: targetUserId })
          .row(1)
          .toMatchObject({ user_id: targetUserId });
      });
    });
  });
});
