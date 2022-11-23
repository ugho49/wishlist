import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { uuid } from '@wishlist/common';
import { TimestampEntity } from '@wishlist/common-database';
import { WishlistEntity } from '../wishlist/wishlist.entity';

@Entity('item')
export class ItemEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @ManyToOne(() => WishlistEntity)
  readonly wishlist: Promise<WishlistEntity>;

  @Column()
  @RelationId((entity: ItemEntity) => entity.wishlist)
  wishlistId: string;
}
