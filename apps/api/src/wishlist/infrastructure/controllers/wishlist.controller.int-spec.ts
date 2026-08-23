import type { RequestApp } from '@wishlist/api-test-utils';

import { Fixtures, useTestApp } from '@wishlist/api-test-utils';
import { uuid } from '@wishlist/common';

describe('WishlistController', () => {
  const { getRequest, getFixtures, expectTable } = useTestApp();
  let fixtures: Fixtures;

  beforeEach(() => {
    fixtures = getFixtures();
  });

  describe('POST /wishlist', () => {
    const path = '/wishlist';

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest();

      await request
        .post(path)
        .field(
          'data',
          JSON.stringify({
            title: 'Test Wishlist',
            description: 'Test Description',
            event_ids: [uuid()],
          }),
        )
        .expect(401);
    });

    describe('when user is authenticated', () => {
      let request: RequestApp;
      let currentUserId: string;

      beforeEach(async () => {
        request = await getRequest({ signedAs: 'BASE_USER' });
        currentUserId = await fixtures.getSignedUserId('BASE_USER');
      });

      it.each([
        {
          body: {},
          case: 'empty body',
          message: ['title should not be empty', 'event_ids should not be empty'],
        },
        {
          body: { title: '' },
          case: 'empty title',
          message: ['title should not be empty'],
        },
        {
          body: { title: 'a'.repeat(101) },
          case: 'title too long',
          message: ['title must be shorter than or equal to 100 characters'],
        },
        {
          body: {
            title: 'Valid Title',
            description: 'a'.repeat(2001),
            event_ids: [uuid()],
          },
          case: 'description too long',
          message: ['description must be shorter than or equal to 2000 characters'],
        },
        {
          body: {
            title: 'Valid Title',
            event_ids: [],
          },
          case: 'empty event_ids array',
          message: ['event_ids should not be empty'],
        },
      ])('should return 400 when invalid input: $case', async ({ body: payload, message }) => {
        await request
          .post(path)
          .field('data', JSON.stringify(payload))
          .expect(400)
          .expect(({ body }) =>
            expect(body).toMatchObject({ error: 'Bad Request', message: expect.arrayContaining(message) }),
          );

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0);
      });

      it('should return 401 when user is not attendee of event', async () => {
        const otherUserId = await fixtures.insertUser({
          email: 'other@test.com',
          firstname: 'Other',
          lastname: 'User',
        });

        const { eventId } = await fixtures.insertEventWithMaintainer({
          title: 'Event',
          description: 'Description',
          maintainerId: otherUserId,
        });

        await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              description: 'Test Description',
              event_ids: [eventId],
            }),
          )
          .expect(401)
          .expect(({ body }) =>
            expect(body).toMatchObject({
              error: 'Unauthorized',
              message: `You cannot add the wishlist to the event ${eventId}`,
            }),
          );

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0);
      });

      it('should create wishlist successfully with one event', async () => {
        const { eventId, eventDate } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        });

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0);
        const response = await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              event_ids: [eventId],
            }),
          )
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              title: 'Test Wishlist',
              config: { hide_items: true },
              items: [],
              owner: {
                id: currentUserId,
                email: Fixtures.BASE_USER_EMAIL,
                firstname: 'John',
                lastname: 'Doe',
              },
              events: expect.toIncludeSameMembers([
                {
                  id: eventId,
                  title: 'Test Event',
                  description: 'Test Description',
                  event_date: eventDate.toISODate(),
                },
              ]),
              created_at: expect.toBeDateString(),
              updated_at: expect.toBeDateString(),
            });
          });

        const createdWishlistId = response.body.id;

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: createdWishlistId,
          title: 'Test Wishlist',
          description: null,
          logo_url: null,
          hide_items: true,
          owner_id: currentUserId,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        });

        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(1).row(0).toEqual({
          event_id: eventId,
          wishlist_id: createdWishlistId,
        });
      });

      it('should create wishlist successfully with one event and full data', async () => {
        const { eventId, eventDate } = await fixtures.insertEventWithMaintainer({
          title: 'Test Event',
          description: 'Test Description',
          maintainerId: currentUserId,
        });

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(0);
        const response = await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              description: 'Test Description',
              event_ids: [eventId],
              hide_items: false,
            }),
          )
          .expect(201)
          .expect(({ body }) => {
            expect(body).toEqual({
              id: expect.toBeString(),
              title: 'Test Wishlist',
              description: 'Test Description',
              config: { hide_items: false },
              items: [],
              owner: {
                id: currentUserId,
                email: Fixtures.BASE_USER_EMAIL,
                firstname: 'John',
                lastname: 'Doe',
              },
              events: expect.toIncludeSameMembers([
                {
                  id: eventId,
                  title: 'Test Event',
                  description: 'Test Description',
                  event_date: eventDate.toISODate(),
                },
              ]),
              created_at: expect.toBeDateString(),
              updated_at: expect.toBeDateString(),
            });
          });

        const createdWishlistId = response.body.id;

        await expectTable(Fixtures.WISHLIST_TABLE).hasNumberOfRows(1).row(0).toMatchObject({
          id: createdWishlistId,
          title: 'Test Wishlist',
          description: 'Test Description',
          logo_url: null,
          hide_items: false,
          owner_id: currentUserId,
          created_at: expect.toBeDate(),
          updated_at: expect.toBeDate(),
        });

        await expectTable(Fixtures.EVENT_WISHLIST_TABLE).hasNumberOfRows(1).row(0).toEqual({
          event_id: eventId,
          wishlist_id: createdWishlistId,
        });
      });

      it('should create wishlist with multiple events', async () => {
        const { eventId: eventId1 } = await fixtures.insertEventWithMaintainer({
          title: 'Event 1',
          description: 'Description 1',
          maintainerId: currentUserId,
        });

        const { eventId: eventId2 } = await fixtures.insertEventWithMaintainer({
          title: 'Event 2',
          description: 'Description 2',
          maintainerId: currentUserId,
        });

        const response = await request
          .post(path)
          .field(
            'data',
            JSON.stringify({
              title: 'Test Wishlist',
              event_ids: [eventId1, eventId2],
            }),
          )
          .expect(201);

        const createdWishlistId = response.body.id;

        await expectTable(Fixtures.EVENT_WISHLIST_TABLE)
          .hasNumberOfRows(2)
          .row(0)
          .toEqual({
            event_id: eventId1,
            wishlist_id: createdWishlistId,
          })
          .row(1)
          .toEqual({
            event_id: eventId2,
            wishlist_id: createdWishlistId,
          });
      });
    });
  });

  // TODO: create later when we are able to mock and assert file upload
  // POST /wishlist/:id/upload-logo
});
