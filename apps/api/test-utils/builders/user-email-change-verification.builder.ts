import type { UserEmailChangeVerificationId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { User } from '../../src/user/domain/model/user.model';
import { UserEmailChangeVerification } from '../../src/user/domain/model/user-email-change-verification.model';
import { UserBuilder } from './user.builder';

type UserEmailChangeVerificationBuilderData = {
  user: User;
  newEmail: string;
  token: string;
  expiredAt: Date;
};

export class UserEmailChangeVerificationBuilder {
  private readonly data: UserEmailChangeVerificationBuilderData = {
    user: new UserBuilder().build(),
    newEmail: 'new@test.fr',
    token: 'email-change-token',
    expiredAt: new Date(Date.now() + 3_600_000),
  };

  withUser(user: User): this {
    this.data.user = user;
    return this;
  }

  withNewEmail(newEmail: string): this {
    this.data.newEmail = newEmail;
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

  build(): UserEmailChangeVerification {
    return UserEmailChangeVerification.create({
      id: uuid() as UserEmailChangeVerificationId,
      user: this.data.user,
      newEmail: this.data.newEmail,
      token: this.data.token,
      expiredAt: this.data.expiredAt,
    });
  }
}
