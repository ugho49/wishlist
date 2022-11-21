import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TimestampEntity, uuid } from '../../../core/database';

@Entity('user_password_verification')
export class UserPasswordVerificationEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  userId: string;

  @Column()
  token: string;

  @Column()
  expiredAt: Date;

  public static create(props: { userId: string; token: string; expiredAt: Date }): UserPasswordVerificationEntity {
    const entity = new UserPasswordVerificationEntity();
    entity.userId = props.userId;
    entity.token = props.token;
    entity.expiredAt = props.expiredAt;
    return entity;
  }
}
