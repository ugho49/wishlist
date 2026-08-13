import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { type CreateNodesV2, createNodesFromFiles } from '@nx/devkit'

export type DrizzlePluginOptions = {
  studioTargetName?: string
  generateTargetName?: string
  migrateTargetName?: string
  seedTargetName?: string
}

export const createNodesV2: CreateNodesV2<DrizzlePluginOptions> = [
  '**/drizzle.config.ts',
  async (configFiles, options, context) => {
    return await createNodesFromFiles(
      configFile => createNodesInternal({ configFilePath: configFile }),
      configFiles,
      options,
      context,
    )
  },
]

function createNodesInternal(params: { configFilePath: string; options?: DrizzlePluginOptions }) {
  const { configFilePath, options } = params
  const root = dirname(configFilePath)

  // because there is also a biome.json/biome.jsonc at the root of the workspace, we want to ignore that one
  // return an empty object if we're at the root so that we don't create a root project

  if (root === '.') {
    return {}
  }

  const seedTarget = {
    [options?.seedTargetName ?? 'drizzle:seed']: {
      command: 'yarn tsx drizzle/seed.ts',
      options: {
        cwd: '{projectRoot}',
        color: true,
      },
      inputs: ['default', '^default', { externalDependencies: ['tsx'] }],
    },
  }

  const seedExists = existsSync(join(root, 'drizzle', 'seed.ts'))

  // Project configuration to be merged into the rest of the Nx configuration
  return {
    projects: {
      [root]: {
        targets: {
          [options?.studioTargetName ?? 'drizzle:studio']: {
            // Nx target syntax to execute a command. More on {projectRoot} below
            command: 'drizzle-kit studio',
            continuous: true,
            options: {
              cwd: '{projectRoot}',
              color: true,
            },
            inputs: ['default', '^default', { externalDependencies: ['drizzle-kit'] }],
          },
          [options?.generateTargetName ?? 'drizzle:generate']: {
            command: 'drizzle-kit generate',
            options: {
              cwd: '{projectRoot}',
              args: ['--name'],
              forwardAllArgs: true,
              color: true,
            },
            inputs: ['default', '^default', { externalDependencies: ['drizzle-kit'] }],
          },
          [options?.migrateTargetName ?? 'drizzle:migrate']: {
            command: 'drizzle-kit migrate',
            options: {
              cwd: '{projectRoot}',
              color: true,
            },
            inputs: ['default', '^default', { externalDependencies: ['drizzle-kit'] }],
          },
          ...(seedExists ? seedTarget : {}),
        },
      },
    },
  }
}
