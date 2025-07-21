import { Fixtures, useTestApp } from '@wishlist/api-test-utils'

describe('UserEmailSettingsController', () => {
  const { getRequest, expectTable, getFixtures } = useTestApp()
  let fixtures: Fixtures

  beforeEach(() => {
    fixtures = getFixtures()
  })

  describe('GET /user/email-settings', () => {
    const path = '/user/email-settings'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.get(path).expect(401)
    })

    it('should return existing email settings', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await fixtures.insertUserEmailSettings({
        userId: await fixtures.getSignedUserId('BASE_USER'),
        emailSettings: { daily_new_item_notification: false },
      })

      await request
        .get(path)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            daily_new_item_notification: false,
          })
        })
    })
  })

  describe('PUT /user/email-settings', () => {
    const path = '/user/email-settings'

    it('should return unauthorized if not authenticated', async () => {
      const request = await getRequest()

      await request.put(path).send({ daily_new_item_notification: true }).expect(401)
    })

    it.each([
      {
        body: {},
        case: 'empty body',
        message: ['daily_new_item_notification should not be empty'],
      },
      {
        body: { daily_new_item_notification: 'not-a-boolean' },
        case: 'daily_new_item_notification not a boolean',
        message: ['daily_new_item_notification must be a boolean value'],
      },
      {
        body: { daily_new_item_notification: 1 },
        case: 'daily_new_item_notification is a number',
        message: ['daily_new_item_notification must be a boolean value'],
      },
      {
        body: { daily_new_item_notification: null },
        case: 'daily_new_item_notification is null',
        message: ['daily_new_item_notification should not be empty'],
      },
    ])('should return 400 when invalid input: $case', async ({ body, message }) => {
      const request = await getRequest({ signedAs: 'BASE_USER' })

      await request
        .put(path)
        .send(body)
        .expect(400)
        .expect(({ body }) =>
          expect(body).toMatchObject({
            error: 'Bad Request',
            message: expect.arrayContaining(message),
          }),
        )
    })

    it('should update existing email settings', async () => {
      const request = await getRequest({ signedAs: 'BASE_USER' })
      const currentUserId = await fixtures.getSignedUserId('BASE_USER')

      await fixtures.insertUserEmailSettings({
        userId: currentUserId,
        emailSettings: { daily_new_item_notification: true },
      })

      await request
        .put(path)
        .send({ daily_new_item_notification: false })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            daily_new_item_notification: false,
          })
        })

      // Verify database was updated
      await expectTable(Fixtures.USER_EMAIL_SETTING_TABLE)
        .hasNumberOfRows(1)
        .row(0)
        .toMatchObject({
          user_id: currentUserId,
          daily_new_item_notification: false,
        })
        .check()
    })
  })
})
