import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { handlers } from '../application';
import { UserController } from './controllers/user.controller';
import { UserAdminController } from './controllers/user-admin.controller';
import { UserFieldResolver } from './resolvers/user.field-resolver';
import { UserResolver } from './resolvers/user.resolver';
import { UserAdminFieldResolver } from './resolvers/user-admin.field-resolver';
import { UserAdminResolver } from './resolvers/user-admin.resolver';
import userConfig from './user.config';
import { UserDataLoaderFactory } from './user.dataloader';

@Module({
  imports: [ConfigModule.forFeature(userConfig)],
  controllers: [UserController, UserAdminController],
  providers: [
    ...handlers,
    UserResolver,
    UserFieldResolver,
    UserAdminResolver,
    UserAdminFieldResolver,
    UserDataLoaderFactory,
  ],
  exports: [UserDataLoaderFactory],
})
export class UserModule {}
