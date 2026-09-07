import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';

describe('NotificationResolver (GraphQL)', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp();
  let fixtures: Fixtures;
  let request: RequestApp;
  let currentUserId: string;

  beforeEach(async () => {
    fixtures = getFixtures();
    request = await getRequest({ signedAs: 'BASE_USER' });
    currentUserId = await fixtures.getSignedUserId('BASE_USER');
  });

  describe('Query myNotifications', () => {
    const query = /* GraphQL */ `
      query MyNotifications($filters: PaginationFilters) {
        myNotifications(filters: $filters) {
          __typename
          ... on UserNotificationsPagedResponse {
            unreadCount
            data {
              id
              type
              title
              body
              read
            }
            pagination {
              totalElements
            }
          }
        }
      }
    `;

    it('should return an empty page when the user has no notifications', async () => {
      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: { page: 1 } } })
        .expect(200);

      expect(res.body.data.myNotifications).toEqual({
        __typename: 'UserNotificationsPagedResponse',
        unreadCount: 0,
        data: [],
        pagination: { totalElements: 0 },
      });
    });

    it('should return the current user notifications and unread count', async () => {
      const unreadId = await fixtures.insertUserNotification({
        userId: currentUserId,
        type: 'new_guest',
        title: 'Nouvel invité',
        body: 'Marie a rejoint Noël',
      });
      await fixtures.insertUserNotification({
        userId: currentUserId,
        type: 'event_reminder',
        title: 'Noël dans 7 jours',
        body: 'L’événement Noël a lieu dans 7 jours.',
        readAt: new Date(),
      });

      const res = await request
        .post('/graphql')
        .send({ query, variables: { filters: { page: 1 } } })
        .expect(200);

      expect(res.body.data.myNotifications.__typename).toBe('UserNotificationsPagedResponse');
      expect(res.body.data.myNotifications.unreadCount).toBe(1);
      expect(res.body.data.myNotifications.pagination.totalElements).toBe(2);
      expect(res.body.data.myNotifications.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: unreadId,
            type: 'NEW_GUEST',
            title: 'Nouvel invité',
            read: false,
          }),
        ]),
      );
    });
  });

  describe('Query unreadNotificationCount', () => {
    const query = /* GraphQL */ `
      query UnreadNotificationCount {
        unreadNotificationCount {
          __typename
          ... on UnreadNotificationCount {
            count
          }
        }
      }
    `;

    it('should return the unread count', async () => {
      await fixtures.insertUserNotification({
        userId: currentUserId,
        type: 'new_guest',
        title: 'Nouvel invité',
        body: 'Marie a rejoint Noël',
      });

      const res = await request.post('/graphql').send({ query }).expect(200);

      expect(res.body.data.unreadNotificationCount).toEqual({
        __typename: 'UnreadNotificationCount',
        count: 1,
      });
    });
  });

  describe('Mutation markNotificationRead', () => {
    const mutation = /* GraphQL */ `
      mutation MarkNotificationRead($id: UserNotificationId!) {
        markNotificationRead(id: $id) {
          __typename
          ... on VoidOutput {
            success
          }
        }
      }
    `;

    it('should mark a notification as read', async () => {
      const id = await fixtures.insertUserNotification({
        userId: currentUserId,
        type: 'new_guest',
        title: 'Nouvel invité',
        body: 'Marie a rejoint Noël',
      });

      const res = await request.post('/graphql').send({ query: mutation, variables: { id } }).expect(200);

      expect(res.body.data.markNotificationRead).toEqual({ __typename: 'VoidOutput', success: true });
      await expectTable(Fixtures.USER_NOTIFICATION_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
        id,
        read_at: expect.toBeDate(),
      });
    });

    it('should reject when the notification belongs to someone else', async () => {
      const otherUserId = await fixtures.insertUser({
        email: 'other-notif@test.fr',
        firstname: 'Other',
        lastname: 'User',
      });
      const id = await fixtures.insertUserNotification({
        userId: otherUserId,
        type: 'new_guest',
        title: 'Nouvel invité',
        body: 'Marie a rejoint Noël',
      });

      const res = await request.post('/graphql').send({ query: mutation, variables: { id } }).expect(200);

      expect(res.body.data.markNotificationRead.__typename).toBe('NotFoundRejection');
    });
  });

  describe('Mutation markAllNotificationsRead', () => {
    const mutation = /* GraphQL */ `
      mutation MarkAllNotificationsRead {
        markAllNotificationsRead {
          __typename
          ... on VoidOutput {
            success
          }
        }
      }
    `;

    it('should mark every unread notification as read', async () => {
      await fixtures.insertUserNotification({
        userId: currentUserId,
        type: 'new_guest',
        title: 'Nouvel invité',
        body: 'Marie a rejoint Noël',
      });
      await fixtures.insertUserNotification({
        userId: currentUserId,
        type: 'event_reminder',
        title: 'Noël dans 7 jours',
        body: 'L’événement Noël a lieu dans 7 jours.',
      });

      const res = await request.post('/graphql').send({ query: mutation }).expect(200);

      expect(res.body.data.markAllNotificationsRead).toEqual({ __typename: 'VoidOutput', success: true });

      const countRes = await request
        .post('/graphql')
        .send({
          query: /* GraphQL */ `
            query UnreadNotificationCount {
              unreadNotificationCount {
                __typename
                ... on UnreadNotificationCount {
                  count
                }
              }
            }
          `,
        })
        .expect(200);

      expect(countRes.body.data.unreadNotificationCount).toEqual({
        __typename: 'UnreadNotificationCount',
        count: 0,
      });
    });
  });
});
