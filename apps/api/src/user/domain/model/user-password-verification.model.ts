import type { UserPasswordVerificationId } from '@wishlist/common'

import type { User } from './user.model'

export type UserPasswordVerificationProps = {
  id: UserPasswordVerificationId
  user: User
  token: string
  expiredAt: Date
  createdAt: Date
  updatedAt: Date
}

export class UserPasswordVerification {
  public readonly id: UserPasswordVerificationId
  public readonly user: User
  public readonly token: string
  public readonly expiredAt: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserPasswordVerificationProps) {
    this.id = props.id
    this.user = props.user
    this.token = props.token
    this.expiredAt = props.expiredAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    id: UserPasswordVerificationId
    user: User
    expiredAt: Date
    token?: string
  }): UserPasswordVerification {
    const now = new Date()
    return new UserPasswordVerification({
      id: params.id,
      user: params.user,
      token: params.token ?? UserPasswordVerification.generateToken(20),
      expiredAt: params.expiredAt,
      createdAt: now,
      updatedAt: now,
    })
  }

  static generateToken(length: number): string {
    return [...Array(length)].map(() => (~~(Math.random() * 36)).toString(36)).join('')
  }

  isExpired(): boolean {
    return new Date() > this.expiredAt
  }
}
