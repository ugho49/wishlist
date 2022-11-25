import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm';
import { uuid } from '@wishlist/common';
import { TimestampEntity } from '@wishlist/common-database';
import { WishlistEntity } from '../wishlist/wishlist.entity';
import { AttendeeEntity } from '../attendee/attendee.entity';
import { UserEntity } from '../user';

@Entity('event')
export class EventEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @Column()
  eventDate: Date;

  @ManyToMany(() => WishlistEntity, (entity) => entity.events)
  @JoinTable({
    name: 'event_wishlist',
    joinColumn: { name: 'event_id' },
    inverseJoinColumn: { name: 'wishlist_id' },
  })
  wishlists: Promise<WishlistEntity[]>;

  @OneToMany(() => AttendeeEntity, (entity) => entity.event, {
    cascade: true,
  })
  attendees: Promise<AttendeeEntity[]>;

  @Column()
  @RelationId((entity: EventEntity) => entity.creator)
  creatorId: string;

  @ManyToOne(() => UserEntity)
  readonly creator: Promise<UserEntity>;

  static create(param: { title: string; description?: string; eventDate: Date; creatorId: string }): EventEntity {
    const entity = new EventEntity();
    entity.title = param.title;
    entity.description = param.description;
    entity.eventDate = param.eventDate;
    entity.creatorId = param.creatorId;
    return entity;
  }
}
