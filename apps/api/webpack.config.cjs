const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
const { join } = require('path')

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
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
  ],
}
