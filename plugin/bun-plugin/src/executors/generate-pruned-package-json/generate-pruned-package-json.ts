import type { PromiseExecutor } from '@nx/devkit';
import type { GeneratePrunedPackageJsonExecutorSchema } from './schema';

import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createPackageJson } from '@nx/js';

type PackageJsonLike = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  trustedDependencies?: string[];
  [key: string]: unknown;
};

const runExecutor: PromiseExecutor<GeneratePrunedPackageJsonExecutorSchema> = async (options, context) => {
  const projectName = context.projectName;
  if (!projectName) {
    throw new Error('Project name is required');
  }
  if (!context.projectGraph) {
    throw new Error('Project graph is required');
  }

  const outputPath = resolve(context.root, options.outputPath);
  const lockfileOutputPath = resolve(
    context.root,
    options.lockfileOutputPath ?? join(dirname(options.outputPath), 'pruned-bun.lock'),
  );

  console.log(`Generating pruned package.json for project ${projectName}`);

  const prunedPackageJson = createPackageJson(projectName, context.projectGraph, {
    root: context.root,
    isProduction: true,
    skipPackageManager: true,
  }) as unknown as PackageJsonLike;

  stripWorkspaceProtocolDependencies(prunedPackageJson);
  await copyTrustedDependencies(context.root, prunedPackageJson);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(prunedPackageJson, null, 2)}\n`);
  console.log(`Generated pruned package.json at ${outputPath}`);

  await generatePrunedLockfile({
    workspaceRoot: context.root,
    prunedPackageJson,
    outputPath: lockfileOutputPath,
  });
  console.log(`Generated pruned bun.lock at ${lockfileOutputPath}`);

  return { success: true };
};

function stripWorkspaceProtocolDependencies(pkg: PackageJsonLike): void {
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
    const deps = pkg[field];
    if (!deps) {
      continue;
    }
    for (const [name, version] of Object.entries(deps)) {
      if (version.startsWith('workspace:') || version.startsWith('file:')) {
        delete deps[name];
      }
    }
  }
}

async function copyTrustedDependencies(workspaceRoot: string, pkg: PackageJsonLike): Promise<void> {
  const rootPackageJson = JSON.parse(await readFile(join(workspaceRoot, 'package.json'), 'utf8')) as PackageJsonLike;
  if (rootPackageJson.trustedDependencies?.length) {
    pkg.trustedDependencies = rootPackageJson.trustedDependencies;
  }
}

async function generatePrunedLockfile(params: {
  workspaceRoot: string;
  prunedPackageJson: PackageJsonLike;
  outputPath: string;
}): Promise<void> {
  const tmp = await mkdtemp(join(tmpdir(), 'wishlist-pruned-'));
  try {
    await writeFile(join(tmp, 'package.json'), `${JSON.stringify(params.prunedPackageJson, null, 2)}\n`);
    await copyFile(join(params.workspaceRoot, 'bunfig.toml'), join(tmp, 'bunfig.toml'));
    await copyFile(join(params.workspaceRoot, 'bun.lock'), join(tmp, 'bun.lock'));

    execFileSync('bun', ['install', '--lockfile-only', '--ignore-scripts'], {
      cwd: tmp,
      stdio: 'inherit',
    });

    await mkdir(dirname(params.outputPath), { recursive: true });
    await copyFile(join(tmp, 'bun.lock'), params.outputPath);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

export default runExecutor;
