/* eslint-disable */
const eslint = require('@eslint/js')
const tslint = require('typescript-eslint')
const jestPlugin = require('eslint-plugin-jest')
const prettierPlugin = require('eslint-plugin-prettier/recommended')
const nxPlugin = require('@nx/eslint-plugin')
const pluginSecurity = require('eslint-plugin-security')

const typescriptPlugin = tslint.plugin

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/*.cjs',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  prettierPlugin,
  pluginSecurity.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      '@nx': nxPlugin,
      security: pluginSecurity,
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.base.json',
      },
    },
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'error',
      // Conflict with prettier
      '@typescript-eslint/arrow-parens': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.int-spec.ts'],
    plugins: {
      jest: jestPlugin,
    },
  },
]
