import type { Fixtures, RequestApp } from '@wishlist/api-test-utils'

import { useTestApp } from '@wishlist/api-test-utils'
import { Authorities } from '@wishlist/common'

describe('Queues Board', () => {
  const { getRequest, getFixtures } = useTestApp()

  let request: RequestApp
  let fixtures: Fixtures

  beforeEach(async () => {
    request = await getRequest()
    fixtures = getFixtures()
  })

  describe('GET /queues', () => {
    const path = '/queues'

    it('should return 401 when no authentication is provided', async () => {
      await request
        .get(path)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            message: 'Authentication required',
          })
        })
    })

    it('should return 401 when invalid authorization header is provided', async () => {
      await request
        .get(path)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            message: 'Authentication required',
          })
        })
    })

    it('should return 401 when invalid credentials format is provided', async () => {
      const invalidBase64 = Buffer.from('invalid-format').toString('base64')

      await request
        .get(path)
        .set('Authorization', `Basic ${invalidBase64}`)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            message: 'Invalid credentials format',
          })
        })
    })

    it('should return 401 when invalid email is provided', async () => {
      const credentials = Buffer.from('nonexistent@test.com:password').toString('base64')

      await request
        .get(path)
        .set('Authorization', `Basic ${credentials}`)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            message: 'Invalid credentials',
          })
        })
    })

    it('should return 401 when invalid password is provided', async () => {
      await fixtures.insertUser({
        email: 'user@test.com',
        firstname: 'Test',
        lastname: 'User',
        password: 'password123',
        authorities: [Authorities.ROLE_ADMIN],
      })

      const credentials = Buffer.from('user@test.com:wrong-password').toString('base64')

      await request
        .get(path)
        .set('Authorization', `Basic ${credentials}`)
        .expect(401)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            message: 'Invalid credentials',
          })
        })
    })

    it('should return 403 when standard user tries to access', async () => {
      const password = 'test-password'

      await fixtures.insertUser({
        email: 'standard@test.com',
        firstname: 'Standard',
        lastname: 'User',
        password,
        authorities: [Authorities.ROLE_USER],
      })

      const credentials = Buffer.from(`standard@test.com:${password}`).toString('base64')

      await request
        .get(path)
        .set('Authorization', `Basic ${credentials}`)
        .expect(403)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            message: 'Insufficient permissions',
          })
        })
    })

    it('should return 200 when admin user accesses with valid credentials', async () => {
      const password = 'admin-password'
      await fixtures.insertUser({
        email: 'admin@test.com',
        firstname: 'Admin',
        lastname: 'User',
        password,
        authorities: [Authorities.ROLE_ADMIN],
      })

      const credentials = Buffer.from(`admin@test.com:${password}`).toString('base64')

      await request.get(path).set('Authorization', `Basic ${credentials}`).expect(200)
    })
  })
})
