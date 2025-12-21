import { registerAs } from '@nestjs/config'
import { mapConfigOrThrow } from '@wishlist/common'
import { z } from 'zod'

const schema = z.object({
  API_VERSION: z.string('Missing API_VERSION environment variable'),
})

export default registerAs('core', () =>
  mapConfigOrThrow(schema, process.env, data => ({
    apiVersion: data.API_VERSION,
  })),
)
