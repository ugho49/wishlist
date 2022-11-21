import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserController } from './controllers/user.controller';
import { UserAdminController } from './controllers/user-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController, UserAdminController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
