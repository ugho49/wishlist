import { uuid } from '@wishlist/common'
import { TimestampEntity } from '@wishlist/common-database'
import { Authorities } from '@wishlist/common-types'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('user')
export class UserEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid()

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

  public isSuperAdmin(): boolean {
    return this.authorities.includes(Authorities.ROLE_SUPERADMIN)
  }

  public isAdmin(): boolean {
    return this.isSuperAdmin() || this.authorities.includes(Authorities.ROLE_ADMIN)
  }
}
