import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm';
import { TimestampEntity, uuid } from '../../../core/database';
import { WishlistEntity } from '../../wishlist/wishlist.entity';
import { AttendeeEntity } from './attendee.entity';
import { UserEntity } from '../../user';

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

  @Column()
  @RelationId((entity: EventEntity) => entity.creator)
  creatorId: string;

  @ManyToOne(() => UserEntity)
  readonly creator: Promise<UserEntity>;
}
