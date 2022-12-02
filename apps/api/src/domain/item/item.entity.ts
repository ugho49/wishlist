import { Column, Entity, ManyToOne, PrimaryColumn, RelationId, JoinColumn } from 'typeorm';
import { uuid } from '@wishlist/common';
import { TimestampEntity } from '@wishlist/common-database';
import { WishlistEntity } from '../wishlist/wishlist.entity';
import { UserEntity } from '../user';

@Entity('item')
export class ItemEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', nullable: true })
  url?: string | null;

  @Column()
  isSuggested: boolean;

  @Column({ type: 'integer', nullable: true })
  score?: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  takenAt?: Date | null;

  @ManyToOne(() => WishlistEntity, { lazy: true })
  readonly wishlist: Promise<WishlistEntity>;

  @Column()
  @RelationId((entity: ItemEntity) => entity.wishlist)
  wishlistId: string;

  @ManyToOne(() => UserEntity, { lazy: true })
  readonly taker?: Promise<UserEntity> | null;

  @Column({ nullable: true })
  @RelationId((entity: ItemEntity) => entity.taker)
  takerId?: string | null;

  static create(param: {
    name: string;
    wishlistId: string;
    description?: string;
    url?: string;
    isSuggested: boolean;
    score?: number;
  }): ItemEntity {
    const entity = new ItemEntity();
    entity.name = param.name;
    entity.wishlistId = param.wishlistId;
    entity.description = param.description;
    entity.url = param.url;
    entity.isSuggested = param.isSuggested;
    entity.score = param.score;
    return entity;
  }

  isNotSuggested() {
    return !this.isSuggested;
  }

  isTakenBySomeone() {
    return this.takerId !== undefined && this.takerId !== null;
  }
}
