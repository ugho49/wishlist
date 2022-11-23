import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@wishlist/common-database';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends BaseRepository(UserEntity) {}
