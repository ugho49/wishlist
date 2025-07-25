import type { Authorities, UserId } from '@wishlist/common'

import { Authorities as Auth } from '@wishlist/common'

export type UserProps = {
  id: UserId
  email: string
  firstName: string
  lastName: string
  birthday?: Date
  passwordEnc?: string
  isEnabled: boolean
  authorities: Authorities[]
  lastIp?: string
  lastConnectedAt?: Date
  pictureUrl?: string
  createdAt: Date
  updatedAt: Date
}

export class User {
  public readonly id: UserId
  public readonly email: string
  public readonly firstName: string
  public readonly lastName: string
  public readonly birthday?: Date
  public readonly passwordEnc?: string
  public readonly isEnabled: boolean
  public readonly authorities: Authorities[]
  public readonly lastIp?: string
  public readonly lastConnectedAt?: Date
  public readonly pictureUrl?: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserProps) {
    this.id = props.id
    this.email = props.email
    this.firstName = props.firstName
    this.lastName = props.lastName
    this.birthday = props.birthday
    this.passwordEnc = props.passwordEnc
    this.isEnabled = props.isEnabled
    this.authorities = props.authorities
    this.lastIp = props.lastIp
    this.lastConnectedAt = props.lastConnectedAt
    this.pictureUrl = props.pictureUrl
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    id: UserId
    email: string
    firstName: string
    lastName: string
    birthday?: Date
    passwordEnc?: string
    ip: string
    pictureUrl?: string
  }): User {
    const now = new Date()
    return new User({
      id: params.id,
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      birthday: params.birthday,
      passwordEnc: params.passwordEnc,
      isEnabled: true,
      authorities: [Auth.ROLE_USER],
      lastIp: params.ip,
      lastConnectedAt: now,
      pictureUrl: params.pictureUrl,
      createdAt: now,
      updatedAt: now,
    })
  }

  isSuperAdmin(): boolean {
    return this.authorities.includes(Auth.ROLE_SUPERADMIN)
  }

  isAdmin(): boolean {
    return this.isSuperAdmin() || this.authorities.includes(Auth.ROLE_ADMIN)
  }

  updateFirstName(firstName: string): User {
    return new User({
      ...this,
      firstName,
      updatedAt: new Date(),
    })
  }

  updateLastName(lastName: string): User {
    return new User({
      ...this,
      lastName,
      updatedAt: new Date(),
    })
  }

  updateBirthday(birthday?: Date): User {
    return new User({
      ...this,
      birthday,
      updatedAt: new Date(),
    })
  }

  updateEmail(email: string): User {
    return new User({
      ...this,
      email,
      updatedAt: new Date(),
    })
  }

  updatePassword(newPasswordEnc: string): User {
    return new User({
      ...this,
      passwordEnc: newPasswordEnc,
      updatedAt: new Date(),
    })
  }

  updateIsEnabled(isEnabled: boolean): User {
    return new User({
      ...this,
      isEnabled,
      updatedAt: new Date(),
    })
  }

  updateLastConnection(ip: string): User {
    return new User({
      ...this,
      lastIp: ip,
      lastConnectedAt: new Date(),
      updatedAt: new Date(),
    })
  }

  updatePicture(pictureUrl?: string): User {
    return new User({
      ...this,
      pictureUrl,
      updatedAt: new Date(),
    })
  }
}
