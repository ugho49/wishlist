import reactPlugin from 'eslint-plugin-react'
import globals from 'globals'

import baseConfig from '../../eslint.config.js'

export default [
  ...baseConfig,
  {
    files: ['**/*.{jsx,tsx}'],
    ...reactPlugin.configs.flat.recommended,
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 0,
      'react/jsx-uses-react': 0,
      'react/no-unescaped-entities': 0,
      'react/no-children-prop': 0,
    },
  },
]
