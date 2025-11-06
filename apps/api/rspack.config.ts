import type { Configuration } from '@rspack/cli'

import { join } from 'node:path'
import { NxAppRspackPlugin } from '@nx/rspack/app-plugin'
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin'

const isDevelopment = process.env.NODE_ENV !== 'production'
const isServer = process.env.WEBPACK_SERVE === 'true'
const outputFileName = 'main.js'

const plugins: Configuration['plugins'] = [
  new NxAppRspackPlugin({
    target: 'node',
    main: 'apps/api/src/main.ts',
    outputFileName,
    tsConfig: 'apps/api/tsconfig.app.json',
    optimization: false,
    outputHashing: 'none',
    generatePackageJson: !isDevelopment,
    sourceMap: true,
    mode: isDevelopment ? 'development' : 'production',
    transformers: [
      {
        name: '@nestjs/swagger/plugin',
        options: {
          dtoFileNameSuffix: ['.dto.ts', '.dtos.ts'],
        },
      },
    ],
    assets: [
      {
        input: 'apps/api/templates',
        glob: '**/*',
        output: 'templates',
      },
      {
        input: 'apps/api/firebase',
        glob: '**/*',
        output: 'firebase',
      },
      {
        input: 'apps/api/drizzle',
        glob: '**/*',
        output: 'drizzle',
      },
    ],
  }),
]

if (isServer) {
  plugins.push(
    new RunScriptWebpackPlugin({
      name: outputFileName,
      autoRestart: true,
    }),
  )
}

export default {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
  },
  devServer: {
    port: 9000, // Use different port than the NestJS app (8080)
    hot: true,
  },
  plugins,
  ignoreWarnings: [
    // Ignore warnings about TypeScript types/interfaces not being found at runtime
    // These are expected since TypeScript types only exist at compile-time
    // and are erased during transpilation. They're used in decorator metadata
    // but the actual values are injected via Symbols at runtime.
    (warning: { message?: string }) => {
      return warning.message?.includes('ESModulesLinkingWarning') ?? false
    },
  ],
} satisfies Configuration
