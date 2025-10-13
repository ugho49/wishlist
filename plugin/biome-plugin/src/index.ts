import { dirname } from 'path'
import { type CreateNodesV2, createNodesFromFiles } from '@nx/devkit'

export type BiomePluginOptions = {
  lintTargetName?: string
  formatTargetName?: string
  checkTargetName?: string
}

export const createNodesV2: CreateNodesV2<BiomePluginOptions> = [
  '**/biome.json',
  async (configFiles, options, context) => {
    return await createNodesFromFiles(
      configFile => createNodesInternal(configFile, options),
      configFiles,
      options,
      context,
    )
  },
]

function createNodesInternal(configFilePath: string, options?: BiomePluginOptions) {
  const root = dirname(configFilePath)

  // because there is also a biome.json at the root of the workspace, we want to ignore that one
  // return an empty object if we're at the root so that we don't create a root project

  if (root === '.') {
    return {}
  }

  const base = {
    cache: true,
    inputs: ['default', '^default', '{workspaceRoot}/biome.json', { externalDependencies: ['@biomejs/biome'] }],
  }

  // Project configuration to be merged into the rest of the Nx configuration
  return {
    projects: {
      [root]: {
        targets: {
          [options?.lintTargetName ?? 'biome:lint']: {
            // Nx target syntax to execute a command. More on {projectRoot} below
            command: 'biome lint {projectRoot}',
            ...base,
          },
          [options?.formatTargetName ?? 'biome:format']: {
            // Nx target syntax to execute a command. More on {projectRoot} below
            command: 'biome format {projectRoot}',
            ...base,
          },
          [options?.checkTargetName ?? 'biome:check']: {
            // Nx target syntax to execute a command. More on {projectRoot} below
            command: 'biome check {projectRoot}',
            ...base,
          },
        },
      },
    },
  }
}
