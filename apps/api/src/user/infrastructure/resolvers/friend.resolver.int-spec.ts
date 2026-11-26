import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';

const GRAPHQL_PATH = '/graphql';

describe('FriendResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable, fillRateLimit, runSql } = useTestApp();
  let fixtures: Fixtures;
  let request: RequestApp;
  let currentUserId: string;
  let eventId: string;

  const friendsQuery = /* GraphQL */ `
    query Friends {
      friends {
        __typename
        ... on FriendsOutput {
          friends {
            source
            sharedEventsCount
            user {
              id
              firstName
            }
          }
          hidden {
            id
          }
        }
      }
    }
  `;

  const getFriends = async (): Promise<{
    friends: Array<{ source: string; sharedEventsCount: number; user: { id: string; firstName: string } }>;
    hidden: Array<{ id: string }>;
  }> => {
    const res = await request.post(GRAPHQL_PATH).send({ query: friendsQuery }).expect(200);
    expect(res.body.data.friends.__typename).toBe('FriendsOutput');
    const { friends, hidden } = res.body.data.friends;
    return { friends, hidden };
  };

  const insertUser = (firstname: string) =>
    fixtures.insertUser({ email: `${firstname.toLowerCase()}@test.fr`, firstname, lastname: 'Test' });

  beforeEach(async () => {
    fixtures = getFixtures();
    request = await getRequest({ signedAs: 'BASE_USER' });
    currentUserId = await fixtures.getSignedUserId('BASE_USER');
    ({ eventId } = await fixtures.insertEventWithCreator({ title: 'Noël', creatorId: currentUserId }));
  });

  describe('Query friends', () => {
    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const res = await anon.post(GRAPHQL_PATH).send({ query: friendsQuery }).expect(200);

      expect(res.body.data?.friends?.__typename).not.toBe('FriendsOutput');
    });

    it('should list co-attendees and added friends by name, without the hidden ones nor strangers', async () => {
      const { userId: zoeId } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'zoe@test.fr',
        firstname: 'Zoe',
        lastname: 'Test',
        eventId,
      });
      const { userId: hiddenId } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'hidden@test.fr',
        firstname: 'Hidden',
        lastname: 'Test',
        eventId,
      });
      const addedId = await insertUser('Adele');
      await insertUser('Stranger');
      await fixtures.insertUserContact({ ownerUserId: currentUserId, contactUserId: addedId, status: 'added' });
      await fixtures.insertUserContact({ ownerUserId: currentUserId, contactUserId: hiddenId, status: 'hidden' });

      const { friends, hidden } = await getFriends();

      expect(friends).toEqual([
        { source: 'ADDED', sharedEventsCount: 0, user: { id: addedId, firstName: 'Adele' } },
        { source: 'EVENT', sharedEventsCount: 1, user: { id: zoeId, firstName: 'Zoe' } },
      ]);
      expect(hidden).toEqual([{ id: hiddenId }]);
    });

    it('should not list someone who only added the current user (it is one-sided)', async () => {
      const ownerId = await insertUser('Owner');
      await fixtures.insertUserContact({ ownerUserId: ownerId, contactUserId: currentUserId, status: 'added' });

      expect((await getFriends()).friends).toEqual([]);
    });
  });

  describe('Mutation addFriend', () => {
    const mutation = /* GraphQL */ `
      mutation AddFriend($email: String!) {
        addFriend(email: $email) {
          __typename
          ... on BusinessRuleRejection {
            code
          }
        }
      }
    `;

    const addFriend = async (email: string) => {
      const res = await request.post(GRAPHQL_PATH).send({ query: mutation, variables: { email } }).expect(200);
      return res.body.data.addFriend;
    };

    it('should not succeed when not authenticated', async () => {
      const anon = await getRequest();
      const res = await anon
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { email: 'paul@test.fr' } })
        .expect(200);

      expect(res.body.data?.addFriend?.__typename).not.toBe('VoidOutput');
      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(0);
    });

    it('should add the account owning the exact email to the circle', async () => {
      const paulId = await insertUser('Paul');

      expect(await addFriend('Paul@Test.fr')).toEqual({ __typename: 'VoidOutput' });

      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        owner_user_id: currentUserId,
        contact_user_id: paulId,
        status: 'added',
      });
      expect((await getFriends()).friends).toEqual([
        { source: 'ADDED', sharedEventsCount: 0, user: { id: paulId, firstName: 'Paul' } },
      ]);
    });

    it.each([
      { case: 'an unknown email', email: 'nobody@test.fr' },
      { case: 'the email of the current user', email: Fixtures.BASE_USER_EMAIL },
    ])('should return NotFoundRejection for $case', async ({ email }) => {
      expect((await addFriend(email)).__typename).toBe('NotFoundRejection');
      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(0);
    });

    it('should return ValidationRejection for an invalid email', async () => {
      expect((await addFriend('not-an-email')).__typename).toBe('ValidationRejection');
    });

    it('should share the userByEmail quota and reject past it', async () => {
      await insertUser('Paul');
      await fillRateLimit(`userByEmail:user:${currentUserId}`, 30);

      expect(await addFriend('paul@test.fr')).toEqual({ __typename: 'BusinessRuleRejection', code: 'RATE_LIMITED' });
      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(0);
    });
  });

  describe('Mutation hideFriend', () => {
    const mutation = /* GraphQL */ `
      mutation HideFriend($userId: UserId!) {
        hideFriend(userId: $userId) {
          __typename
        }
      }
    `;

    const hideFriend = async (userId: string) => {
      const res = await request.post(GRAPHQL_PATH).send({ query: mutation, variables: { userId } }).expect(200);
      return res.body.data.hideFriend.__typename;
    };

    it('should not succeed when not authenticated', async () => {
      const zoeId = await insertUser('Zoe');
      const anon = await getRequest();
      const res = await anon
        .post(GRAPHQL_PATH)
        .send({ query: mutation, variables: { userId: zoeId } })
        .expect(200);

      expect(res.body.data?.hideFriend?.__typename).not.toBe('VoidOutput');
      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(0);
    });

    it('should take a co-attendee out of the circle, the picker included', async () => {
      const { userId: zoeId } = await fixtures.insertUserAndAddItToEventAsAttendee({
        email: 'zoe@test.fr',
        firstname: 'Zoe',
        lastname: 'Test',
        eventId,
      });

      expect(await hideFriend(zoeId)).toBe('VoidOutput');

      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        owner_user_id: currentUserId,
        contact_user_id: zoeId,
        status: 'hidden',
      });
      expect(await getFriends()).toEqual({ friends: [], hidden: [{ id: zoeId }] });

      const search = await request
        .post(GRAPHQL_PATH)
        .send({
          query: /* GraphQL */ `
            query Picker {
              searchUsers(keyword: "zoe") {
                ... on SearchUsersOutput {
                  users {
                    id
                  }
                }
              }
              closestFriends {
                ... on ClosestFriendsOutput {
                  users {
                    id
                  }
                }
              }
            }
          `,
        })
        .expect(200);
      expect(search.body.data.searchUsers.users).toEqual([]);
      expect(search.body.data.closestFriends.users).toEqual([]);
    });

    it('should return NotFoundRejection for a user outside the circle', async () => {
      const strangerId = await insertUser('Stranger');

      expect(await hideFriend(strangerId)).toBe('NotFoundRejection');
      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(0);
    });

    it('should return ValidationRejection for an invalid user id', async () => {
      expect(await hideFriend('not-a-uuid')).toBe('ValidationRejection');
    });
  });

  describe('Mutation unhideFriend', () => {
    const mutation = /* GraphQL */ `
      mutation UnhideFriend($userId: UserId!) {
        unhideFriend(userId: $userId) {
          __typename
        }
      }
    `;

    const unhideFriend = async (userId: string) => {
      const res = await request.post(GRAPHQL_PATH).send({ query: mutation, variables: { userId } }).expect(200);
      return res.body.data.unhideFriend.__typename;
    };

    it('should bring a hidden user back into the circle as an added friend', async () => {
      const zoeId = await insertUser('Zoe');
      await fixtures.insertUserContact({ ownerUserId: currentUserId, contactUserId: zoeId, status: 'hidden' });

      expect(await unhideFriend(zoeId)).toBe('VoidOutput');

      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(1).row(0).toMatchObject({ status: 'added' });
      expect(await getFriends()).toEqual({
        friends: [{ source: 'ADDED', sharedEventsCount: 0, user: { id: zoeId, firstName: 'Zoe' } }],
        hidden: [],
      });
    });

    it('should return NotFoundRejection for a user who is not hidden', async () => {
      const zoeId = await insertUser('Zoe');

      expect(await unhideFriend(zoeId)).toBe('NotFoundRejection');
      await expectTable(Fixtures.USER_CONTACT_TABLE).hasNumberOfRows(0);
    });
  });

  describe('Circle of the user picker', () => {
    it('should find an added friend who shares no event, but not a disabled one', async () => {
      const paulId = await insertUser('Paul');
      const offId = await insertUser('Paulette');
      await fixtures.insertUserContact({ ownerUserId: currentUserId, contactUserId: paulId, status: 'added' });
      await fixtures.insertUserContact({ ownerUserId: currentUserId, contactUserId: offId, status: 'added' });
      await runSql(`UPDATE "user" SET is_enabled = false WHERE id = '${offId}'`);

      const res = await request
        .post(GRAPHQL_PATH)
        .send({
          query: /* GraphQL */ `
            query Picker {
              searchUsers(keyword: "paul") {
                ... on SearchUsersOutput {
                  users {
                    id
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(res.body.data.searchUsers.users).toEqual([{ id: paulId }]);
    });
  });
});
