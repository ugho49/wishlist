import { Column, Entity, PrimaryColumn } from 'typeorm';
import { uuid } from '@wishlist/common';
import { TimestampEntity } from '@wishlist/common-database';
import { UserSocialType } from '@wishlist/common-types';

@Entity('user_social')
export class UserSocialEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  userId: string;

  @Column()
  socialId: string;

  @Column()
  socialType: UserSocialType;

  @Column({ type: 'varchar', nullable: true })
  pictureUrl?: string | null;

  public static create(props: {
    userId: string;
    socialId: string;
    socialType: UserSocialType;
    pictureUrl?: string;
  }): UserSocialEntity {
    const entity = new UserSocialEntity();
    entity.userId = props.userId;
    entity.socialId = props.socialId;
    entity.socialType = props.socialType;
    entity.pictureUrl = props.pictureUrl;
    return entity;
  }
}
