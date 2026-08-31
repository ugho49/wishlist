import type { UserId } from '@wishlist/common';

import { Authorities } from '../authorities.enum';

export type UserProps = {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  birthday?: Date;
  isEnabled: boolean;
  authorities: Authorities[];
  pictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  public readonly id: UserId;
  public readonly email: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly birthday?: Date;
  public readonly isEnabled: boolean;
  public readonly authorities: Authorities[];
  public readonly pictureUrl?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.birthday = props.birthday;
    this.isEnabled = props.isEnabled;
    this.authorities = props.authorities;
    this.pictureUrl = props.pictureUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(params: {
    id: UserId;
    email: string;
    firstName: string;
    lastName: string;
    birthday?: Date;
    pictureUrl?: string;
  }): User {
    const now = new Date();
    return new User({
      id: params.id,
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      birthday: params.birthday,
      isEnabled: true,
      authorities: [Authorities.ROLE_USER],
      pictureUrl: params.pictureUrl,
      createdAt: now,
      updatedAt: now,
    });
  }

  isSuperAdmin(): boolean {
    return this.authorities.includes(Authorities.ROLE_SUPERADMIN);
  }

  isAdmin(): boolean {
    return this.isSuperAdmin() || this.authorities.includes(Authorities.ROLE_ADMIN);
  }

  updateFirstName(firstName: string): User {
    return new User({
      ...this,
      firstName,
      updatedAt: new Date(),
    });
  }

  updateLastName(lastName: string): User {
    return new User({
      ...this,
      lastName,
      updatedAt: new Date(),
    });
  }

  updateBirthday(birthday?: Date): User {
    return new User({
      ...this,
      birthday,
      updatedAt: new Date(),
    });
  }

  updateEmail(email: string): User {
    return new User({
      ...this,
      email,
      updatedAt: new Date(),
    });
  }

  updateIsEnabled(isEnabled: boolean): User {
    return new User({
      ...this,
      isEnabled,
      updatedAt: new Date(),
    });
  }

  updatePicture(pictureUrl?: string): User {
    return new User({
      ...this,
      pictureUrl,
      updatedAt: new Date(),
    });
  }
}
