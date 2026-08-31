import type { UserAccountId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { type User } from '../../src/user/domain/model/user.model';
import { UserAccount } from '../../src/user/domain/model/user-account.model';
import { type SocialAccountProvider, UserAccountProvider } from '../../src/user/domain/user-account-provider.enum';

type UserAccountBuilderData = {
  user?: User;
  email?: string;
  provider: SocialAccountProvider;
  providerAccountId: string;
  passwordHash?: string;
  pictureUrl?: string;
};

export class UserAccountBuilder {
  private readonly data: UserAccountBuilderData = {
    provider: UserAccountProvider.GOOGLE,
    providerAccountId: 'google-123',
  };

  withUser(user: User): this {
    this.data.user = user;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withGoogle(providerAccountId = 'google-123'): this {
    this.data.provider = UserAccountProvider.GOOGLE;
    this.data.providerAccountId = providerAccountId;
    return this;
  }

  withPictureUrl(pictureUrl: string): this {
    this.data.pictureUrl = pictureUrl;
    return this;
  }

  withPasswordHash(passwordHash: string): this {
    this.data.passwordHash = passwordHash;
    return this;
  }

  buildPassword(user: User, passwordHash: string): UserAccount {
    return UserAccount.createPasswordAccount({
      id: uuid() as UserAccountId,
      userId: user.id,
      email: this.data.email ?? user.email,
      passwordHash,
    });
  }

  build(user?: User): UserAccount {
    const accountUser = user ?? this.data.user;
    if (!accountUser) {
      throw new Error('UserAccountBuilder requires a user');
    }

    return UserAccount.createSocialAccount({
      id: uuid() as UserAccountId,
      userId: accountUser.id,
      email: this.data.email ?? accountUser.email,
      provider: this.data.provider,
      providerAccountId: this.data.providerAccountId,
      pictureUrl: this.data.pictureUrl,
    });
  }
}
