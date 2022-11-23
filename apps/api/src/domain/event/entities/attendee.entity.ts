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
  userId?: string;

  @ManyToOne(() => EventEntity, (entity) => entity.attendees)
  readonly event: Promise<EventEntity>;

  @ManyToOne(() => UserEntity)
  readonly user?: Promise<UserEntity | null>;

  @Column({ name: 'temp_user_email' })
  email?: string;

  // TODO -->
  // @Convert(converter = AttendeeRoleConverter.class)
  @Column()
  role: string;

  // TODO

  static createFromExistingUser(param: { eventId: string; userId: string; role: string }): AttendeeEntity {
    const entity = new AttendeeEntity();
    entity.eventId = param.eventId;
    entity.userId = param.userId;
    entity.role = param.role;
    return entity;
  }

  static createFromNonExistingUser(param: { eventId: string; email: string; role: string }): AttendeeEntity {
    const entity = new AttendeeEntity();
    entity.eventId = param.eventId;
    entity.email = param.email;
    entity.role = param.role;
    return entity;
  }
}
