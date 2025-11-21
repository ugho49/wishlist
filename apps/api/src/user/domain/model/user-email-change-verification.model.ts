import type { UserEmailChangeVerificationId } from '@wishlist/common'
import type { User } from './user.model'

export type UserEmailChangeVerificationProps = {
  id: UserEmailChangeVerificationId
  user: User
  newEmail: string
  token: string
  expiredAt: Date
  createdAt: Date
  updatedAt: Date
}

export class UserEmailChangeVerification {
  public readonly id: UserEmailChangeVerificationId
  public readonly user: User
  public readonly newEmail: string
  public readonly token: string
  public readonly expiredAt: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserEmailChangeVerificationProps) {
    this.id = props.id
    this.user = props.user
    this.newEmail = props.newEmail
    this.token = props.token
    this.expiredAt = props.expiredAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    id: UserEmailChangeVerificationId
    user: User
    newEmail: string
    expiredAt: Date
    token?: string
  }): UserEmailChangeVerification {
    const now = new Date()
    return new UserEmailChangeVerification({
      id: params.id,
      user: params.user,
      newEmail: params.newEmail,
      token: params.token ?? UserEmailChangeVerification.generateToken(20),
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

  invalidate(): UserEmailChangeVerification {
    return new UserEmailChangeVerification({
      ...this,
      expiredAt: new Date(),
      updatedAt: new Date(),
    })
  }
}
