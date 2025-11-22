import type { AbstractStartedContainer, StartedDockerComposeEnvironment } from 'testcontainers'

import { join } from 'node:path'
import { DockerComposeEnvironment } from 'testcontainers'

let teardown = false

// Number of parallel workers - should match vitest config maxWorkers
const MAX_WORKERS = 4

export default async function () {
  const rootFolder = process.cwd()
  const dockerFolder = join(rootFolder, 'docker')

  console.log(`Setting up ${MAX_WORKERS} Docker Compose environments for parallel test execution`)

  // Start multiple Docker Compose environments in parallel
  const environments: StartedDockerComposeEnvironment[] = []

  const startPromises = Array.from({ length: MAX_WORKERS }, async (_, index) => {
    const workerId = index + 1
    console.log(`Starting Docker Compose environment for worker ${workerId}...`)

    const environment = await new DockerComposeEnvironment(rootFolder, [
      join(dockerFolder, 'docker-compose.yml'),
      join(dockerFolder, 'docker-compose.test.yml'),
    ]).up()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const containers = environment.startedGenericContainers as Record<string, AbstractStartedContainer>

    // Extract and expose ports for this worker
    for (const container of Object.values(containers)) {
      const containerName = container.getName().split('-')[0]?.toUpperCase()

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const boundedPorts = container.boundPorts as { ports: Map<number, number> }
      for (const [internal, external] of boundedPorts.ports) {
        const internalPort = internal.toString().split('/')[0]
        const variable = `DOCKER_WORKER_${workerId}_${containerName}_PORT_${internalPort}`
        process.env[variable] = external.toString()
        console.log(`export ${variable}=${external}`)
      }
    }

    console.log(`Worker ${workerId} environment ready ✅`)
    return environment
  })

  // Wait for all environments to start
  const startedEnvironments = await Promise.all(startPromises)
  environments.push(...startedEnvironments)

  console.log(`All ${MAX_WORKERS} Docker Compose environments started successfully`)

  return async () => {
    if (teardown) {
      throw new Error('teardown called twice')
    }
    teardown = true

    console.log(`Stopping ${environments.length} Docker Compose environments...`)

    // Stop all environments in parallel
    await Promise.all(
      environments.map(async (env, index) => {
        console.log(`Stopping environment ${index + 1}...`)
        await env.down()
        await env.stop()
      }),
    )

    console.log('All Docker environments stopped')
  }
}
