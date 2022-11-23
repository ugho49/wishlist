import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEmailSettingEntity } from './email-settings.entity';
import { EmailSettingsService } from './email-settings.service';
import { EmailSettingsController } from './email-settings.controller';
import { EmailSettingsRepository } from './email-settings.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEmailSettingEntity])],
  controllers: [EmailSettingsController],
  providers: [EmailSettingsService, EmailSettingsRepository],
})
export class EmailSettingsModule {}
