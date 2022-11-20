import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { DomainModule } from './domain/domain.module';

@Module({
  imports: [CoreModule, DomainModule],
})
export class AppModule {}
