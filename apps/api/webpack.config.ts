import type { WebpackPluginInstance } from 'webpack'

import { join } from 'node:path'
import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin'
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin'

const isDevelopment = process.env.NODE_ENV !== 'production'
const isServer = process.env.WEBPACK_SERVE === 'true'
const outputFileName = 'main.js'

const plugins: WebpackPluginInstance[] = [
  new NxAppWebpackPlugin({
    target: 'node',
    compiler: 'tsc',
    main: './src/main.ts',
    outputFileName,
    tsConfig: './tsconfig.app.json',
    optimization: false,
    outputHashing: 'none',
    generatePackageJson: !isDevelopment,
    sourceMap: true,
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
        glob: '**/*.(hbs|mjml)',
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
      {
        input: 'apps/api/src',
        glob: '**/*.graphql',
        output: 'graphql',
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
    ...(isDevelopment && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  // Write files to disk in development mode for RunScriptWebpackPlugin
  devServer: {
    port: 9000, // Use different port than the NestJS app (8080)
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },
  plugins,
}
