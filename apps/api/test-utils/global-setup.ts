import { dirname, join } from 'node:path'
import * as dotenv from 'dotenv'

import { afterAll } from 'bun:test'

const backendRoot = process.cwd()
const monorepoRoot = dirname(dirname(backendRoot))
const dockerFolder = join(monorepoRoot, 'docker')
const dockerComposeBase = join(dockerFolder, 'docker-compose.yml')
const dockerComposeTest = join(dockerFolder, 'docker-compose.test.yml')

startContainers()
runMigrations()

afterAll(() => {
  stopContainers()
})

function startContainers() {
  console.log('Starting integration test containers...')

  const upResult = Bun.spawnSync(
    [
      'sh',
      '-c',
      `docker compose -f ${dockerComposeBase} -f ${dockerComposeTest} up -d --wait || exit $(docker compose -f ${dockerComposeBase} -f ${dockerComposeTest} ps -qa | xargs docker inspect -f '{{.State.ExitCode}}' | grep -v '^0' | wc -l)`,
    ],
    {
      stdout: 'inherit',
      stderr: 'inherit',
    },
  )

  if (!upResult.success) {
    console.error(`docker compose up failed with exit code ${upResult.exitCode}`)
    process.exit(1)
  }

  const dockerContainers = Bun.spawnSync(
    ['docker', 'compose', '-f', dockerComposeBase, '-f', dockerComposeTest, 'ps', '--format', 'json', '--all'],
    {
      stdout: 'pipe',
      stderr: 'inherit',
    },
  )

  if (!dockerContainers.success) {
    console.error('Failed to get docker containers')
    process.exit(1)
  }

  const output = dockerContainers.stdout?.toString().trim() ?? ''
  if (!output) {
    console.error('No containers found from docker compose ps')
    process.exit(1)
  }

  const lines = output.split('\n').filter(Boolean)

  for (const line of lines) {
    const container = JSON.parse(line) as {
      Name: string
      Service: string
      Publishers: Array<{ PublishedPort: number; TargetPort: number }> | null
    }

    if (container.Publishers) {
      for (const publisher of container.Publishers) {
        if (publisher.PublishedPort > 0) {
          const serviceName = container.Service.toUpperCase()
          const variable = `DOCKER_${serviceName}_PORT_${publisher.TargetPort}`
          process.env[variable] = `${publisher.PublishedPort}`
          console.log(`export ${variable}=${publisher.PublishedPort}`)
        }
      }
    }
  }

  const configOutput = dotenv.config({ path: join(backendRoot, '.env.test:int'), override: true })

  for (const [key, value] of Object.entries(configOutput.parsed ?? {})) {
    if (value.includes('$DOCKER_')) {
      process.env[key] = value.replace(/\$([A-Z_][A-Z0-9_]*)/g, (_, varName) => process.env[varName] ?? '')
    }
  }

  console.log('Integration test containers started\n')
}

function stopContainers() {
  console.log('Stopping integration test containers...')

  Bun.spawnSync(['docker', 'compose', '-f', dockerComposeBase, '-f', dockerComposeTest, 'down'], {
    stdout: 'inherit',
    stderr: 'inherit',
  })
  console.log('Integration test containers stopped\n')
}

function runMigrations() {
  console.log('Running Drizzle migrations...')
  const migrateResult = Bun.spawnSync(['bun', 'nx', 'run', 'api:drizzle:migrate'], {
    cwd: monorepoRoot,
    stdout: 'inherit',
    stderr: 'inherit',
    env: process.env,
  })

  if (!migrateResult.success) {
    console.error('Failed to run Drizzle migrations')
    throw new Error('Failed to run Drizzle migrations')
  }

  console.log('Migrations completed\n')
}
