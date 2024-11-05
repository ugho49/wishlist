import { uuid } from '@wishlist/common'
import { TimestampEntity } from '@wishlist/common-database'
import { AttendeeRole, EventId } from '@wishlist/common-types'
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm'

import { AttendeeEntity } from '../attendee/attendee.entity'
import { WishlistEntity } from '../wishlist/wishlist.entity'

@Entity('event')
export class EventEntity extends TimestampEntity {
  @PrimaryColumn()
  id: EventId = uuid() as EventId

  @Column()
  title: string

  @Column({ type: 'varchar', nullable: true })
  description?: string | null

  @Column()
  eventDate: Date

  @ManyToMany(() => WishlistEntity, entity => entity.events)
  @JoinTable({
    name: 'event_wishlist',
    joinColumn: { name: 'event_id' },
    inverseJoinColumn: { name: 'wishlist_id' },
  })
  wishlists: Promise<WishlistEntity[]>

  @OneToMany(() => AttendeeEntity, entity => entity.event, {
    cascade: true,
  })
  attendees: Promise<AttendeeEntity[]>

  static create(param: { title: string; description?: string; eventDate: Date }): EventEntity {
    const entity = new EventEntity()
    entity.title = param.title
    entity.description = param.description
    entity.eventDate = param.eventDate
    return entity
  }

  async canEdit(currentUser: { id: string; isAdmin: boolean }): Promise<boolean> {
    const attendees = await this.attendees
    const attendee = attendees.find(a => a.userId === currentUser.id)
    if (!attendee) return false
    return currentUser.isAdmin || [AttendeeRole.MAINTAINER].includes(attendee.role)
  }
}
