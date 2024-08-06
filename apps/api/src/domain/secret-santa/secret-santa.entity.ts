import { uuid } from '@wishlist/common'
import { ColumnNumericTransformer, TimestampEntity } from '@wishlist/common-database'
import { SecretSantaStatus } from '@wishlist/common-types'
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm'

import { AttendeeEntity } from '../attendee/attendee.entity'
import { EventEntity } from '../event/event.entity'

@Entity('secret_santa')
export class SecretSantaEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid()

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
  eventId: string

  @OneToMany(() => SecretSantaUserEntity, entity => entity.secretSanta, {
    cascade: true,
  })
  users: Promise<SecretSantaUserEntity[]>

  public static create(props: { description?: string; budget?: number; eventId: string }): SecretSantaEntity {
    const entity = new SecretSantaEntity()
    entity.description = props.description
    entity.budget = props.budget
    entity.eventId = props.eventId
    return entity
  }
}

@Entity('secret_santa_user')
export class SecretSantaUserEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid()

  @ManyToOne(() => AttendeeEntity)
  readonly attendee: Promise<AttendeeEntity>

  @Column()
  @RelationId((entity: SecretSantaUserEntity) => entity.attendee)
  attendeeId: string

  @ManyToOne(() => SecretSantaUserEntity)
  readonly drawUser: Promise<SecretSantaUserEntity | null>

  @Column({ type: 'uuid', nullable: true })
  @RelationId((entity: SecretSantaUserEntity) => entity.drawUser)
  drawUserId?: string | null

  @ManyToOne(() => SecretSantaEntity)
  readonly secretSanta: Promise<SecretSantaEntity>

  @Column()
  @RelationId((entity: SecretSantaUserEntity) => entity.secretSanta)
  secretSantaId: string

  @Column('uuid', { array: true })
  exclusions: string[] = []

  public static create(props: { attendeeId: string; secretSantaId: string }): SecretSantaUserEntity {
    const entity = new SecretSantaUserEntity()
    entity.attendeeId = props.attendeeId
    entity.secretSantaId = props.secretSantaId
    return entity
  }
}
