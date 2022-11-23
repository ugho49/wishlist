import { Injectable } from '@nestjs/common';
import { EventEntity } from './entities/event.entity';
import { BaseRepository } from '@wishlist/common-database';

@Injectable()
export class EventRepository extends BaseRepository(EventEntity) {}
