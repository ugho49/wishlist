import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

/**
 * @deprecated: will be replaced by drizzle
 */
export abstract class TimestampEntity {
  @CreateDateColumn()
  createdAt: Date = new Date()

  @UpdateDateColumn()
  updatedAt: Date = new Date()
}
