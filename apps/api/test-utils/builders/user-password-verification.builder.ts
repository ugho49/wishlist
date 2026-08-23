import type { UserPasswordVerificationId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { User } from '../../src/user/domain/model/user.model';
import { UserPasswordVerification } from '../../src/user/domain/model/user-password-verification.model';
import { UserBuilder } from './user.builder';

type UserPasswordVerificationBuilderData = {
  user: User;
  token: string;
  expiredAt: Date;
};

export class UserPasswordVerificationBuilder {
  private readonly data: UserPasswordVerificationBuilderData = {
    user: new UserBuilder().build(),
    token: 'reset-token',
    expiredAt: new Date(Date.now() + 3_600_000),
  };

  withUser(user: User): this {
    this.data.user = user;
    return this;
  }

  withToken(token: string): this {
    this.data.token = token;
    return this;
  }

  expired(): this {
    this.data.expiredAt = new Date(Date.now() - 1000);
    return this;
  }

  build(): UserPasswordVerification {
    return UserPasswordVerification.create({
      id: uuid() as UserPasswordVerificationId,
      user: this.data.user,
      token: this.data.token,
      expiredAt: this.data.expiredAt,
    });
  }
}
