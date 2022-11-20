import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TimestampEntity, uuid } from '../../core/database';
import { UserDto } from './user.dto';

@Entity('user')
export class UserEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid();

  @Column()
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  passwordEnc: string;

  @Column()
  isActive: boolean = true;

  public static create(props: { email: string; firstname: string; lastname: string; passwordEnc: string }): UserEntity {
    const entity = new UserEntity();
    entity.email = props.email;
    entity.firstname = props.firstname;
    entity.lastname = props.lastname;
    entity.passwordEnc = props.passwordEnc;
    return entity;
  }

  public toDto(): UserDto {
    return {
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
