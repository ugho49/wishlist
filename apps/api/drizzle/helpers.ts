import { customType, timestamp } from 'drizzle-orm/pg-core'

// Helper function to create branded UUID types
export const brandedUuid = <T extends string>() =>
  customType<{ data: T; driverData: string }>({
    dataType: () => 'uuid',
    toDriver: (value: T): string => value,
    fromDriver: (value: string): T => value as T,
  })

export const timestampWithTimezone = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' })
