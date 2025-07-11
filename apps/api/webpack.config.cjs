const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
const { join } = require('path')

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
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
      ],
    }),
  ],
}
