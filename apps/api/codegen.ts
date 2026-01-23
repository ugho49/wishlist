import type { CodegenConfig } from '@graphql-codegen/cli'
import type { Ids } from '@wishlist/common'

import { loadSchemaWithoutResolvedFields } from './codegen-schema-transform'

const getBrandedType = (type: keyof Ids): string => `Ids["${type}"]`

const scalarIds: Record<keyof Ids, string> = {
  EventId: getBrandedType('EventId'),
  WishlistId: getBrandedType('WishlistId'),
  AttendeeId: getBrandedType('AttendeeId'),
  UserId: getBrandedType('UserId'),
  UserSocialId: getBrandedType('UserSocialId'),
  UserEmailSettingId: getBrandedType('UserEmailSettingId'),
  UserEmailChangeVerificationId: getBrandedType('UserEmailChangeVerificationId'),
  UserPasswordVerificationId: getBrandedType('UserPasswordVerificationId'),
  SecretSantaId: getBrandedType('SecretSantaId'),
  SecretSantaUserId: getBrandedType('SecretSantaUserId'),
  ItemId: getBrandedType('ItemId'),
}

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
          ...scalarIds,
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
