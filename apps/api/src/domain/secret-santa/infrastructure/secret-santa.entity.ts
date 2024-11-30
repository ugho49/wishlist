import type { AttendeeId, EventId, SecretSantaId, SecretSantaUserId } from '@wishlist/common-types'

import { uuid } from '@wishlist/common'
import { ColumnNumericTransformer, TimestampEntity } from '@wishlist/common-database'
import { SecretSantaStatus } from '@wishlist/common-types'
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm'

import { AttendeeEntity } from '../../attendee/attendee.entity'
import { EventEntity } from '../../event/event.entity'

@Entity('secret_santa')
export class SecretSantaEntity extends TimestampEntity {
  @PrimaryColumn()
  id: SecretSantaId = uuid() as SecretSantaId

  @Column({ type: 'varchar', nullable: true })
  description?: string | null

  @Column({ type: 'numeric', nullable: true, transformer: new ColumnNumericTransformer() })
  budget?: number | null

  @Column('varchar')
  status: SecretSantaStatus = SecretSantaStatus.CREATED

  @ManyToOne(() => EventEntity)
  readonly event: Promise<EventEntity>

  @Column()
  @RelationId((entity: SecretSantaEntity) => entity.event)
  eventId: EventId

  @OneToMany(() => SecretSantaUserEntity, entity => entity.secretSanta, {
    cascade: true,
  })
  users: Promise<SecretSantaUserEntity[]>

  public static create(props: { description?: string; budget?: number; eventId: EventId }): SecretSantaEntity {
    const entity = new SecretSantaEntity()
    entity.description = props.description
    entity.budget = props.budget
    entity.eventId = props.eventId
    return entity
  }

  isStarted(): boolean {
    return this.status === SecretSantaStatus.STARTED
  }

  isCreated(): boolean {
    return this.status === SecretSantaStatus.CREATED
  }
}

@Entity('secret_santa_user')
export class SecretSantaUserEntity extends TimestampEntity {
  @PrimaryColumn()
  id: SecretSantaUserId = uuid() as SecretSantaUserId

  @ManyToOne(() => AttendeeEntity)
  readonly attendee: Promise<AttendeeEntity>

  @Column()
  @RelationId((entity: SecretSantaUserEntity) => entity.attendee)
  attendeeId: AttendeeId

  @ManyToOne(() => SecretSantaUserEntity)
  readonly drawUser: Promise<SecretSantaUserEntity | null>

  @Column({ type: 'uuid', nullable: true })
  @RelationId((entity: SecretSantaUserEntity) => entity.drawUser)
  drawUserId?: SecretSantaUserId | null

  @ManyToOne(() => SecretSantaEntity)
  readonly secretSanta: Promise<SecretSantaEntity>

  @Column()
  @RelationId((entity: SecretSantaUserEntity) => entity.secretSanta)
  secretSantaId: SecretSantaId

  @Column('uuid', { array: true })
  exclusions: SecretSantaUserId[] = []

  public static create(props: { attendeeId: AttendeeId; secretSantaId: SecretSantaId }): SecretSantaUserEntity {
    const entity = new SecretSantaUserEntity()
    entity.attendeeId = props.attendeeId
    entity.secretSantaId = props.secretSantaId
    return entity
  }
}
