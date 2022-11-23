import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { uuid } from '@wishlist/common';
import { EventEntity } from './event.entity';
import { UserEntity } from '../../user';

@Entity('event_attendee')
export class AttendeeEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  @RelationId((entity: AttendeeEntity) => entity.event)
  eventId: string;

  @Column()
  @RelationId((entity: AttendeeEntity) => entity.user)
  userId: string;

  @ManyToOne(() => EventEntity, (entity) => entity.attendees)
  readonly event: Promise<EventEntity>;

  @ManyToOne(() => UserEntity)
  readonly user: Promise<UserEntity>;
  // TODO
}
