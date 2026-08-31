import type { UserAccountId, UserId } from '@wishlist/common';
import type { SocialAccountProvider } from '../user-account-provider.enum';

import { UserAccountProvider } from '../user-account-provider.enum';

export type UserAccountProps = {
  id: UserAccountId;
  userId: UserId;
  provider: UserAccountProvider;
  email: string;
  providerAccountId?: string;
  passwordHash?: string;
  pictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class UserAccount {
  public readonly id: UserAccountId;
  public readonly userId: UserId;
  public readonly provider: UserAccountProvider;
  public readonly email: string;
  public readonly providerAccountId?: string;
  public readonly passwordHash?: string;
  public readonly pictureUrl?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserAccountProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.provider = props.provider;
    this.email = props.email;
    this.providerAccountId = props.providerAccountId;
    this.passwordHash = props.passwordHash;
    this.pictureUrl = props.pictureUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createPasswordAccount(params: {
    id: UserAccountId;
    userId: UserId;
    email: string;
    passwordHash: string;
  }): UserAccount {
    const now = new Date();
    return new UserAccount({
      id: params.id,
      userId: params.userId,
      provider: UserAccountProvider.PASSWORD,
      email: params.email,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createSocialAccount(params: {
    id: UserAccountId;
    userId: UserId;
    email: string;
    provider: SocialAccountProvider;
    providerAccountId: string;
    pictureUrl?: string;
  }): UserAccount {
    const now = new Date();
    return new UserAccount({
      id: params.id,
      userId: params.userId,
      provider: params.provider,
      email: params.email,
      providerAccountId: params.providerAccountId,
      pictureUrl: params.pictureUrl,
      createdAt: now,
      updatedAt: now,
    });
  }

  updatePictureUrl(pictureUrl?: string): UserAccount {
    return new UserAccount({
      ...this,
      pictureUrl,
      updatedAt: new Date(),
    });
  }

  updateEmail(email: string): UserAccount {
    return new UserAccount({
      ...this,
      email,
      updatedAt: new Date(),
    });
  }

  updatePasswordHash(passwordHash: string): UserAccount {
    return new UserAccount({
      ...this,
      passwordHash,
      updatedAt: new Date(),
    });
  }
}
