import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEntity])],
})
export class ItemModule {}
