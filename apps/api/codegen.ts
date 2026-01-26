import type { CodegenConfig } from '@graphql-codegen/cli'

import { gqlScalarIds } from '../../libs/common/src/ids'
import { loadSchemaWithoutResolvedFields } from './codegen-schema-transform'

const config: CodegenConfig = {
  generates: {
    'src/gql/generated-types.ts': {
      schema: loadSchemaWithoutResolvedFields(),
      plugins: [
        {
          add: {
            content: [
              '/* ********************************************************** */\n' +
                '/*   THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)    */\n' +
                '/* ********************************************************** */\n' +
                '\n',
            ],
          },
        },
        {
          add: {
            content: ["import type { Ids } from '@wishlist/common'"],
          },
        },
        'typescript',
        'typescript-operations',
      ],
      config: {
        preResolveTypes: true,
        useIndexSignature: true,
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        defaultScalarType: 'unknown',
        scalars: {
          ...gqlScalarIds,
        },
      },
    },
    'schema.graphql': {
      schema: 'src/**/*.graphql',
      plugins: [
        'schema-ast',
        {
          add: {
            content: [
              '# ------------------------------------------------------\n' +
                '# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)\n' +
                '# ------------------------------------------------------\n' +
                '\n',
            ],
          },
        },
      ],
      config: {
        includeDirectives: true,
      },
    },
  },
}

export default config
