import fs from 'node:fs/promises'
import { App } from 'octokit'
import { z } from 'zod'

const schema = z.object({
  GITHUB_APP_ID: z.string(),
  GITHUB_APP_PRIVATE_KEY_BASE_64_ENCODED: z.string(),
  GITHUB_INSTALLATION_ID: z.coerce.number(),
})

const config = z.parse(schema, process.env)

const privateKey = Buffer.from(config.GITHUB_APP_PRIVATE_KEY_BASE_64_ENCODED, 'base64').toString('utf-8')

const app = new App({
  appId: config.GITHUB_APP_ID,
  privateKey,
})

const { data } = await app.octokit.request('POST /app/installations/{installation_id}/access_tokens', {
  installation_id: config.GITHUB_INSTALLATION_ID,
})

console.log('token created:', data.token)

await fs.writeFile('github_token', data.token)

console.log('token saved to github_token file')
