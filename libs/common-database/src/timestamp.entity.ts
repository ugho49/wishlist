import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimestampEntity {
  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();
}
