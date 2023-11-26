import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@wishlist/common-database';
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity';

@Injectable()
export class SecretSantaRepository extends BaseRepository(SecretSantaEntity) {}

@Injectable()
export class SecretSantaUserRepository extends BaseRepository(SecretSantaUserEntity) {}
