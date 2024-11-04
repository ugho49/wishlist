import { Brand, uuid } from '@wishlist/common'

import { Authorities } from '../enums'
import { UserSocial } from './user-social'

export type UserId = Brand<string, 'UserId'>

export class User {
  public readonly id: UserId
  public readonly authorities: Authorities[]
  public readonly birthday?: Date
  public readonly email: string
  public readonly firstName: string
  public readonly lastName: string
  public readonly isEnabled: boolean
  public readonly lastConnectedAt?: Date
  public readonly lastIp?: string
  public readonly passwordEnc?: string
  public readonly pictureUrl?: string
  public readonly socials: UserSocial[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: UserId
    authorities?: Authorities[]
    birthday?: Date
    email: string
    firstName: string
    lastName: string
    isEnabled?: boolean
    lastConnectedAt?: Date
    lastIp?: string
    passwordEnc?: string
    pictureUrl?: string
    socials?: UserSocial[]
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.authorities = props.authorities ?? [Authorities.ROLE_USER]
    this.birthday = props.birthday
    this.email = props.email
    this.firstName = props.firstName
    this.lastName = props.lastName
    this.isEnabled = props.isEnabled ?? true
    this.lastConnectedAt = props.lastConnectedAt
    this.lastIp = props.lastIp
    this.passwordEnc = props.passwordEnc
    this.pictureUrl = props.pictureUrl
    this.socials = props.socials ?? []
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static getNewId(): UserId {
    return uuid() as UserId
  }

  updatePictureUrl(newPictureUrl: string | undefined): User {
    return new User({
      ...this,
      pictureUrl: newPictureUrl,
    })
  }

  public isSuperAdmin(): boolean {
    return this.authorities.includes(Authorities.ROLE_SUPERADMIN)
  }

  public isAdmin(): boolean {
    return this.isSuperAdmin() || this.authorities.includes(Authorities.ROLE_ADMIN)
  }
}
