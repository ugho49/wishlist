import type { CodegenConfig } from '@graphql-codegen/cli';

import { gqlScalarIds } from '../../libs/common/src/ids';

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
            content: ["import type { Ids } from '@wishlist/common'"],
          },
        },
        'typescript-operations',
        'typescript-react-query',
      ],
      config: {
        scalars: {
          ...gqlScalarIds,
        },
        importSchemaTypesFrom: './src/gql/__generated__/types',
        namespacedImportName: 'Types',
        documentMode: 'string',
        fetcher: {
          func: '../fetcher#fetchGql',
          isReactHook: false,
        },
        reactQueryVersion: 5,
      },
    },
  },
};

export default config;
