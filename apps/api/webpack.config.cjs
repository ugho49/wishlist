const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
const { join } = require('path')
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin')

const isDevelopment = process.env.NODE_ENV !== 'production'
const outputFileName = 'main.js'

module.exports = {
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
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      outputFileName,
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: !isDevelopment,
      sourceMaps: true,
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
      ],
    }),
    ...(isDevelopment
      ? [
          new RunScriptWebpackPlugin({
            name: outputFileName,
            autoRestart: true,
          }),
        ]
      : []),
  ],
}
