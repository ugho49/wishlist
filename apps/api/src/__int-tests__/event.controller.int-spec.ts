import { DateTime } from 'luxon'

import { Fixtures, useTestApp } from './utils'

describe('EventController', () => {
  const { getRequest, getFixtures } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('GET /event', () => {
    const path = '/event'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.get(path).expect(401)
    })

    it('should return events when user is creator', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const currentUserId = await fixtures.getSignedUserId('BASE_USER')
      const userId2 = await fixtures.insertUser({
        email: 'user2@user2.fr',
        firstname: 'User2',
        lastname: 'USER2',
      })

      const event1Date = DateTime.now().plus({ days: 1 })
      const eventId1 = await fixtures.insertEvent({
        title: 'Event1',
        description: 'Description1',
        eventDate: event1Date.toJSDate(),
        creatorId: currentUserId,
      })

      const event2Date = DateTime.now().plus({ year: 1 }).toJSDate()
      await fixtures.insertEvent({
        title: 'Event2',
        description: 'Description2',
        eventDate: event2Date,
        creatorId: userId2,
      })

      await request
        .get(path)
        .expect(200)
        .expect(({ body }) =>
          expect(body).toEqual({
            resources: [
              {
                id: eventId1,
                title: 'Event1',
                description: 'Description1',
                event_date: event1Date.toISODate(),
                created_by: { id: currentUserId, email: Fixtures.BASE_USER_EMAIL, firstname: 'John', lastname: 'Doe' },
                nb_wishlists: 0,
                nb_attendees: 0,
                attendees: [],
                created_at: expect.toBeDateString(),
                updated_at: expect.toBeDateString(),
              },
            ],
            pagination: { page_number: 1, total_elements: 1, total_pages: 1, pages_size: 10 },
          }),
        )
    })

    // TODO: it('should return events when user is attendee', async () => {})
    // TODO: it('should return no events when user not part of any events', async () => {})
  })
})
