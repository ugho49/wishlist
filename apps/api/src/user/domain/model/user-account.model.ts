import type { UserAccountId } from '@wishlist/common';
import type { SocialAccountProvider } from '../user-account-provider.enum';
import type { User } from './user.model';

import { UserAccountProvider } from '../user-account-provider.enum';

export type UserAccountProps = {
  id: UserAccountId;
  user: User;
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
  public readonly user: User;
  public readonly provider: UserAccountProvider;
  public readonly email: string;
  public readonly providerAccountId?: string;
  public readonly passwordHash?: string;
  public readonly pictureUrl?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserAccountProps) {
    this.id = props.id;
    this.user = props.user;
    this.provider = props.provider;
    this.email = props.email;
    this.providerAccountId = props.providerAccountId;
    this.passwordHash = props.passwordHash;
    this.pictureUrl = props.pictureUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createPassword(params: { id: UserAccountId; user: User; email: string; passwordHash: string }): UserAccount {
    const now = new Date();
    return new UserAccount({
      id: params.id,
      user: params.user,
      provider: UserAccountProvider.PASSWORD,
      email: params.email,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  static createSocial(params: {
    id: UserAccountId;
    user: User;
    email: string;
    provider: SocialAccountProvider;
    providerAccountId: string;
    pictureUrl?: string;
  }): UserAccount {
    const now = new Date();
    return new UserAccount({
      id: params.id,
      user: params.user,
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
