import { dirname } from 'path'
import { type CreateNodesV2, createNodesFromFiles } from '@nx/devkit'

export type IntegrationTestsPluginOptions = {
  intTestTargetName?: string
}

export const createNodesV2: CreateNodesV2<IntegrationTestsPluginOptions> = [
  '**/vitest.config.int.ts',
  async (configFiles, options, context) => {
    return await createNodesFromFiles(
      configFile => createNodesInternal({ configFilePath: configFile }),
      configFiles,
      options,
      context,
    )
  },
]

function createNodesInternal(params: { configFilePath: string; options?: IntegrationTestsPluginOptions }) {
  const { configFilePath, options } = params
  const root = dirname(configFilePath)

  // because there is also a biome.json/biome.jsonc at the root of the workspace, we want to ignore that one
  // return an empty object if we're at the root so that we don't create a root project

  if (root === '.') {
    return {}
  }

  const base = {
    cache: true,
    inputs: ['default', '^production', { externalDependencies: ['vitest'], env: ['CI'] }],
    outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
  }

  // Project configuration to be merged into the rest of the Nx configuration
  return {
    projects: {
      [root]: {
        targets: {
          [options?.intTestTargetName ?? 'test:int']: {
            // Nx target syntax to execute a command. More on {projectRoot} below
            command: 'vitest --dir {projectRoot} --config {projectRoot}/vitest.config.int.ts',
            ...base,
          },
        },
      },
    },
  }
}
