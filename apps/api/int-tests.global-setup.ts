import type { AbstractStartedContainer } from 'testcontainers'

import { join } from 'node:path'
import * as dotenv from 'dotenv'
import { DockerComposeEnvironment } from 'testcontainers'

let teardown = false

export default async function () {
  const rootFolder = process.cwd()
  const dockerFolder = join(rootFolder, 'docker')

  console.log('Setting up integration tests with Docker')

  const environment = await new DockerComposeEnvironment(rootFolder, [
    join(dockerFolder, 'docker-compose.yml'),
    join(dockerFolder, 'docker-compose.test.yml'),
  ]).up()

  // @ts-expect-error
  const containers = environment.startedGenericContainers as Record<string, AbstractStartedContainer>
  const configOutput = dotenv.config({ path: join(__dirname, '.env.test:int') })

  for (const container of Object.values(containers)) {
    const containerName = container.getName().split('-')[0]?.toUpperCase()

    // @ts-expect-error
    const boundedPorts = container.boundPorts as { ports: Map<number, number> }
    for (const [internal, external] of boundedPorts.ports) {
      const internalPort = internal.toString().split('/')[0]
      const variable = `DOCKER_${containerName}_PORT_${internalPort}`
      process.env[variable] = external.toString()
      console.log(`export ${variable}=${external}`)
    }
  }

  for (const [key, value] of Object.entries(configOutput.parsed ?? {})) {
    if (value.startsWith('$')) {
      const variable = value.replace('$', '')
      process.env[key] = process.env[variable]
    }
  }

  return async () => {
    if (teardown) {
      throw new Error('teardown called twice')
    }
    teardown = true

    console.log('Stopping Docker...')

    await environment.down()
    await environment.stop()

    console.log('Docker stopped')
  }
}
