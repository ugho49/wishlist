import type { StartedDockerComposeEnvironment } from 'testcontainers'

const teardown = async () => {
  console.log('Stopping Docker...')

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const environment = global.environment as StartedDockerComposeEnvironment

  await environment.down()
  await environment.stop()

  console.log('Docker stopped')
}

export default teardown
