import type { DrizzleDatabase } from '@wishlist/api/core'
import type { UserEmailSettingId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { schema } from '@wishlist/api-drizzle'
import { uuid } from '@wishlist/common'

import { insertRow, type LooseInsert } from './insert-row'

type UserEmailSettingInsert = InferInsertModel<typeof schema.userEmailSetting>

export type CreateUserEmailSettingOverrides = LooseInsert<UserEmailSettingInsert> & {
  userId: string
}

export function createUserEmailSettingFactory(db: DrizzleDatabase) {
  return {
    create(overrides: CreateUserEmailSettingOverrides) {
      return insertRow(db, schema.userEmailSetting, {
        id: uuid() as UserEmailSettingId,
        dailyNewItemNotification: true,
        ...overrides,
      } as UserEmailSettingInsert)
    },
  }
}
