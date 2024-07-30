import * as request from 'supertest'

import { useTestApp } from '../../__test__'

describe('HealthController', () => {
  const { getHttpServer } = useTestApp()

  it('GET /health', () => {
    return request(getHttpServer())
      .get('/health')
      .expect(200)
      .expect({
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      })
  })
})
