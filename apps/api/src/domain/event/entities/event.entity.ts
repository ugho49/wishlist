import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { TimestampEntity, uuid } from '../../../core/database';
import { WishlistEntity } from '../../wishlist/wishlist.entity';
import { AttendeeEntity } from './attendee.entity';

@Entity('event')
export class EventEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  title: string;

  @Column()
  description?: string;

  @Column()
  eventDate: Date;

  @ManyToMany(() => WishlistEntity, (entity) => entity.events)
  @JoinTable({
    name: 'event_wishlist',
    joinColumn: { name: 'event_id' },
    inverseJoinColumn: { name: 'wishlist_id' },
  })
  wishlists: Promise<WishlistEntity[]>;

  @OneToMany(() => AttendeeEntity, (entity) => entity.event)
  attendees: Promise<AttendeeEntity[]>;
}
