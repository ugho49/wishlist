import type { CodegenConfig } from '@graphql-codegen/cli'

import { gqlScalarIds } from '../../libs/common/src/ids'

const config: CodegenConfig = {
  schema: '../api/schema.graphql',
  documents: ['src/**/*.graphql'],
  ignoreNoDocuments: true,
  generates: {
    'src/gql/__generated__/types.ts': {
      plugins: [
        {
          add: {
            content: ["import type { Ids } from '@wishlist/common'"],
          },
        },
        'typescript',
        'typescript-operations',
      ],
      config: {
        scalars: {
          ...gqlScalarIds,
        },
      },
    },
    'src/gql/__generated__/graphql.ts': {
      plugins: [
        {
          add: {
            content: ["import type * as Types from './types'"],
          },
        },
        'typescript-react-query',
      ],
      config: {
        fetcher: {
          func: '../fetcher#fetchGql',
          isReactHook: false,
        },
        importOperationTypesFrom: 'Types',
        reactQueryVersion: 5,
      },
    },
  },
}

export default config
