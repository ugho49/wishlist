import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { uuid } from '@wishlist/common';
import { EventEntity } from '../event/event.entity';
import { UserEntity } from '../user';
import { AttendeeRole } from '@wishlist/common-types';

@Entity('event_attendee')
export class AttendeeEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  @RelationId((entity: AttendeeEntity) => entity.event)
  eventId: string;

  @Column({ type: 'uuid', nullable: true })
  @RelationId((entity: AttendeeEntity) => entity.user)
  userId?: string | null;

  @ManyToOne(() => EventEntity, (entity) => entity.attendees)
  readonly event: Promise<EventEntity>;

  @ManyToOne(() => UserEntity)
  readonly user: Promise<UserEntity | null>;

  @Column({ name: 'temp_user_email', type: 'varchar', nullable: true })
  email?: string | null;

  @Column()
  role!: AttendeeRole;

  static createFromExistingUser(param: { eventId: string; userId: string; role: AttendeeRole }): AttendeeEntity {
    const entity = new AttendeeEntity();
    entity.eventId = param.eventId;
    entity.userId = param.userId;
    entity.role = param.role;
    return entity;
  }

  static createFromNonExistingUser(param: { eventId: string; email: string; role: AttendeeRole }): AttendeeEntity {
    const entity = new AttendeeEntity();
    entity.eventId = param.eventId;
    entity.email = param.email;
    entity.role = param.role;
    return entity;
  }
}
