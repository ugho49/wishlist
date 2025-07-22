import { useTestApp } from '@wishlist/api-test-utils'

describe('HealthController', () => {
  const { getRequest } = useTestApp()

  it('GET /health', async () => {
    const request = await getRequest()

    await request.get('/health').expect(200).expect({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    })
  })
})
