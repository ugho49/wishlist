import { uuid } from '@wishlist/common'
import { TimestampEntity } from '@wishlist/common-database'
import { Authorities, UserId } from '@wishlist/common-types'
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'

import { UserSocialEntity } from './user-social.entity'

@Entity('user')
export class UserEntity extends TimestampEntity {
  @PrimaryColumn()
  id: UserId = uuid() as UserId

  @Column()
  email: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ type: 'timestamp', nullable: true })
  birthday?: Date | null

  @Column({ type: 'varchar', nullable: true })
  passwordEnc?: string | null

  @Column()
  isEnabled: boolean = true

  @Column('text', { array: true })
  authorities: Authorities[] = [Authorities.ROLE_USER]

  @Column({ type: 'varchar', nullable: true })
  lastIp?: string | null

  @Column({ type: 'timestamptz', nullable: true })
  lastConnectedAt?: Date | null

  @Column({ type: 'varchar', nullable: true })
  pictureUrl?: string | null

  @OneToMany(() => UserSocialEntity, social => social.user, {
    cascade: true,
    lazy: true,
  })
  socials: Promise<UserSocialEntity[]>

  public static create(props: {
    email: string
    firstName: string
    lastName: string
    birthday?: Date
    passwordEnc?: string
    ip: string
    pictureUrl?: string
  }): UserEntity {
    const entity = new UserEntity()
    entity.email = props.email
    entity.firstName = props.firstName
    entity.lastName = props.lastName
    entity.birthday = props.birthday
    entity.passwordEnc = props.passwordEnc
    entity.lastIp = props.ip
    entity.lastConnectedAt = new Date()
    entity.pictureUrl = props.pictureUrl
    return entity
  }

  public isSuperAdmin(): boolean {
    return this.authorities.includes(Authorities.ROLE_SUPERADMIN)
  }

  public isAdmin(): boolean {
    return this.isSuperAdmin() || this.authorities.includes(Authorities.ROLE_ADMIN)
  }
}
