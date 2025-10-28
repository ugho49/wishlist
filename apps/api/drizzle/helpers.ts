import { customType, timestamp } from 'drizzle-orm/pg-core'

// Helper function to create branded UUID types
export const brandedUuid = <T extends string>() =>
  customType<{ data: T; driverData: string }>({
    dataType: () => 'uuid',
    toDriver: (value: T): string => value,
    fromDriver: (value: string): T => value as T,
  })

export const timestampWithTimezone = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

export const timestamps = {
  createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
  updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
}

export const numericNullable = (name: string) =>
  customType<{ data: number | undefined; driverData: string | null }>({
    dataType: () => 'numeric',
    toDriver: (value: number | undefined): string | null => value?.toString() ?? null,
    fromDriver: (value: string | null): number | undefined => (value ? parseFloat(value) : undefined),
  })(name)
