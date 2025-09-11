import eslint from '@eslint/js'
import nxPlugin from '@nx/eslint-plugin'
import vitestPlugin from '@vitest/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier/recommended'
import pluginSecurity from 'eslint-plugin-security'
import tslint from 'typescript-eslint'

const typescriptPlugin = tslint.plugin

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
const config = [
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
        tsconfigRootDir: import.meta.dirname,
        project: './tsconfig.base.json',
      },
    },
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'require-await': 'off',
      '@typescript-eslint/no-deprecated': 'warn',
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
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      'vitest/expect-expect': 'off',
      'vitest/no-commented-out-tests': 'off',
    },
  },
]

export default config
