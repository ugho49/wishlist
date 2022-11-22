import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { TimestampEntity, uuid } from '../../core/database';
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
