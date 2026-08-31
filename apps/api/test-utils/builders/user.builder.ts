import type { ICurrentUser, UserId, UserRefreshTokenId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { Authorities } from '../../src/user/domain/authorities.enum';
import { User } from '../../src/user/domain/model/user.model';
import { generateEmail } from '../data-generator.utils';

type UserBuilderData = {
  email: string;
  firstName: string;
  lastName: string;
  authorities: Authorities[];
  isEnabled: boolean;
};

export class UserBuilder {
  private readonly data: UserBuilderData = {
    email: generateEmail(),
    firstName: 'Jean',
    lastName: 'Dupont',
    authorities: [Authorities.ROLE_USER],
    isEnabled: true,
  };

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withName(params: { firstName: string; lastName: string }): this {
    this.data.firstName = params.firstName;
    this.data.lastName = params.lastName;
    return this;
  }

  disabled(): this {
    this.data.isEnabled = false;
    return this;
  }

  asAdmin(): this {
    this.data.authorities = [Authorities.ROLE_ADMIN];
    return this;
  }

  asSuperAdmin(): this {
    this.data.authorities = [Authorities.ROLE_SUPERADMIN];
    return this;
  }

  build(): User {
    const user = User.create({
      id: uuid() as UserId,
      email: this.data.email,
      firstName: this.data.firstName,
      lastName: this.data.lastName,
    });

    if (
      this.data.isEnabled &&
      this.data.authorities.length === 1 &&
      this.data.authorities[0] === Authorities.ROLE_USER
    ) {
      return user;
    }

    return new User({
      ...user,
      authorities: this.data.authorities,
      isEnabled: this.data.isEnabled,
    });
  }
}

export function toCurrentUser(user: User, sessionId?: UserRefreshTokenId): ICurrentUser {
  return {
    id: user.id,
    email: user.email,
    authorities: user.authorities,
    isAdmin: user.isAdmin(),
    isSuperAdmin: user.isSuperAdmin(),
    sessionId,
  };
}
