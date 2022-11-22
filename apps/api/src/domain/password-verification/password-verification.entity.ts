import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';
import { TimestampEntity, uuid } from '../../core/database';
import { UserEntity } from '../user';

@Entity('user_password_verification')
export class PasswordVerificationEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @ManyToOne(() => UserEntity)
  readonly user: Promise<UserEntity>;

  @Column()
  @RelationId((entity: PasswordVerificationEntity) => entity.user)
  userId: string;

  @Column()
  token: string;

  @Column()
  expiredAt: Date;

  public static create(props: { user: string; token: string; expiredAt: Date }): PasswordVerificationEntity {
    const entity = new PasswordVerificationEntity();
    entity.userId = props.user;
    entity.token = props.token;
    entity.expiredAt = props.expiredAt;
    return entity;
  }
}
