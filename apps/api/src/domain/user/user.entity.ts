import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TimestampEntity, uuid } from '../../core/database';
import { Authorities } from '@wishlist/common-types';

@Entity('user')
export class UserEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  birthday?: Date;

  @Column()
  passwordEnc: string;

  @Column()
  isEnabled: boolean = true;

  @Column('text', { array: true })
  authorities: Authorities[] = [Authorities.ROLE_USER];

  @Column()
  lastIp?: string;

  @Column()
  lastConnectedAt?: Date;

  public static create(props: {
    email: string;
    firstName: string;
    lastName: string;
    birthday?: Date;
    passwordEnc: string;
  }): UserEntity {
    const entity = new UserEntity();
    entity.email = props.email;
    entity.firstName = props.firstName;
    entity.lastName = props.lastName;
    entity.birthday = props.birthday;
    entity.passwordEnc = props.passwordEnc;
    return entity;
  }
}
