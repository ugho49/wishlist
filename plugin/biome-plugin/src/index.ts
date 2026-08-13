import { existsSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { type CreateNodesV2, createNodesFromFiles } from '@nx/devkit'

export type BiomePluginOptions = {
  lintTargetName?: string
  formatTargetName?: string
  checkTargetName?: string
}

export const createNodesV2: CreateNodesV2<BiomePluginOptions> = [
  '**/biome.{json,jsonc}',
  async (configFiles, options, context) => {
    // Get root biome.json or biome.jsonc path
    // const rootBiomeJsonAbsolutePath = context.workspaceRoot.find(
    //   file => file.endsWith('biome.json') || file.endsWith('biome.jsonc'),
    // )
    const rootBiomeJsonAbsolutePath = [
      join(context.workspaceRoot, 'biome.json'),
      join(context.workspaceRoot, 'biome.jsonc'),
    ].find(file => existsSync(file))

    return await createNodesFromFiles(
      configFile => createNodesInternal({ configFilePath: configFile, options, rootBiomeJsonAbsolutePath }),
      configFiles,
      options,
      context,
    )
  },
]

function createNodesInternal(params: {
  configFilePath: string
  options?: BiomePluginOptions
  rootBiomeJsonAbsolutePath?: string
}) {
  const { configFilePath, options, rootBiomeJsonAbsolutePath } = params
  const root = dirname(configFilePath)

  // because there is also a biome.json/biome.jsonc at the root of the workspace, we want to ignore that one
  // return an empty object if we're at the root so that we don't create a root project

  if (root === '.') {
    return {}
  }

  const inputs = [
    'default',
    '^default',
    ...(rootBiomeJsonAbsolutePath ? [`{workspaceRoot}/${basename(rootBiomeJsonAbsolutePath)}`] : []),
    { externalDependencies: ['@biomejs/biome'] },
  ]

  const base = {
    cache: true,
    inputs,
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
