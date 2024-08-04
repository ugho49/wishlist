import { dirname, join } from 'node:path'
import type { AbstractStartedContainer } from 'testcontainers'

import * as dotenv from 'dotenv'
import { DockerComposeEnvironment } from 'testcontainers'

const setup = async () => {
  const rootFolder = dirname(dirname(process.cwd()))
  const dockerFolder = join(rootFolder, 'docker')

  console.log('Setting up integration tests with Docker')

  const environment = await new DockerComposeEnvironment(rootFolder, [
    join(dockerFolder, 'docker-compose.yml'),
    join(dockerFolder, 'docker-compose.test.yml'),
  ]).up()

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const containers = environment.startedGenericContainers as Record<string, AbstractStartedContainer>

  for (const container of Object.values(containers)) {
    const containerName = container.getName().split('-')[0].toUpperCase()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const boundedPorts = container.boundPorts as { ports: Map<number, number> }
    for (const [internal, external] of boundedPorts.ports) {
      const variable = `DOCKER_${containerName}_PORT_${internal}`
      process.env[variable] = external.toString()
      console.log(`export ${variable}=${external}`)
    }

    const configOutput = dotenv.config({ path: './.env.test:int' })

    for (const [key, value] of Object.entries(configOutput.parsed ?? {})) {
      if (value.startsWith('$')) {
        const variable = value.replace('$', '')
        process.env[key] = process.env[variable]
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // Add environment to global in order to use it in teardown
    global.environment = environment
  }
}

export default setup
