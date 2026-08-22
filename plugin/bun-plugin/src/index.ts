import { dirname } from 'node:path';
import { type CreateNodesV2, createNodesFromFiles } from '@nx/devkit';

export type BunPluginOptions = {
  generatePrunedPackageJsonTargetName?: string;
};

export const createNodesV2: CreateNodesV2<BunPluginOptions> = [
  'apps/*/Dockerfile',
  async (configFiles, options, context) =>
    await createNodesFromFiles(
      configFile => createNodesInternal({ configFilePath: configFile, options }),
      configFiles,
      options,
      context,
    ),
];

function createNodesInternal(params: { configFilePath: string; options?: BunPluginOptions }) {
  const { configFilePath, options } = params;
  const root = dirname(configFilePath);
  const targetName = options?.generatePrunedPackageJsonTargetName ?? 'generate-pruned-package-json';

  return {
    projects: {
      [root]: {
        targets: {
          [targetName]: {
            executor: '@wishlist/bun-plugin:generate-pruned-package-json',
            cache: true,
            inputs: [
              'production',
              '^production',
              '{workspaceRoot}/package.json',
              '{workspaceRoot}/bun.lock',
              '{workspaceRoot}/bunfig.toml',
            ],
            outputs: ['{projectRoot}/pruned-package.json', '{projectRoot}/pruned-bun.lock'],
            options: {
              outputPath: '{projectRoot}/pruned-package.json',
              lockfileOutputPath: '{projectRoot}/pruned-bun.lock',
            },
          },
        },
      },
    },
  };
}
