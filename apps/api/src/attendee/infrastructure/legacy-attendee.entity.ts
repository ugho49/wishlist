import type { AttendeeId, EventId, UserId } from '@wishlist/common'

import { UserEntity } from '@wishlist/api/user'
import { AttendeeRole, uuid } from '@wishlist/common'
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm'

import { EventEntity } from '../../event/infrastructure/legacy-event.entity'

@Entity('event_attendee')
export class AttendeeEntity {
  @PrimaryColumn('uuid')
  id: AttendeeId = uuid() as AttendeeId

  @Column('uuid')
  @RelationId((entity: AttendeeEntity) => entity.event)
  eventId!: EventId

  @Column({ type: 'uuid', nullable: true })
  @RelationId((entity: AttendeeEntity) => entity.user)
  userId?: UserId | null

  @ManyToOne(() => EventEntity, entity => entity.attendees)
  readonly event!: Promise<EventEntity>

  @ManyToOne(() => UserEntity)
  user!: Promise<UserEntity | null>

  @Column({ name: 'temp_user_email', type: 'varchar', nullable: true })
  email?: string | null

  @Column('varchar')
  role!: AttendeeRole

  static createFromExistingUser(param: { eventId: EventId; userId: UserId; role: AttendeeRole }): AttendeeEntity {
    const entity = new AttendeeEntity()
    entity.eventId = param.eventId
    entity.userId = param.userId
    entity.role = param.role
    return entity
  }

  static createFromNonExistingUser(param: { eventId: EventId; email: string; role: AttendeeRole }): AttendeeEntity {
    const entity = new AttendeeEntity()
    entity.eventId = param.eventId
    entity.email = param.email
    entity.role = param.role
    return entity
  }
}
