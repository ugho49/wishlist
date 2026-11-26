import type { ICurrentUser, UserId } from '@wishlist/common';

import { Authorities } from '../authorities.enum';
import { SignupSource } from '../signup-source.enum';
import { UserMergeSide } from '../user-merge-side.enum';

export type UserMergeProfileSelection = {
  email: UserMergeSide;
  firstName: UserMergeSide;
  lastName: UserMergeSide;
  birthday: UserMergeSide;
  picture: UserMergeSide;
};

export type UserProps = {
  id: UserId;
  email: string;
  firstName: string;
  lastName: string;
  birthday?: Date;
  signupSource?: SignupSource;
  signupSourceDetail?: string;
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
  public readonly signupSource?: SignupSource;
  public readonly signupSourceDetail?: string;
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
    this.signupSource = props.signupSource;
    this.signupSourceDetail = props.signupSourceDetail;
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

  /**
   * An admin manages regular users; only a super-admin manages admins, and nobody manages a super-admin.
   */
  canBeManagedBy(currentUser: ICurrentUser): boolean {
    if (this.isSuperAdmin()) {
      return false;
    }

    return !this.isAdmin() || currentUser.isSuperAdmin;
  }

  /**
   * Profile of this (kept) user once `source` is merged into it. Identity, access rights and status stay
   * the kept user's; the signup source falls back to the merged user's when the kept user has none.
   */
  absorbProfile(source: User, selection: UserMergeProfileSelection): User {
    const pick = <K extends keyof UserProps>(side: UserMergeSide, key: K): UserProps[K] =>
      side === UserMergeSide.SOURCE ? source[key] : this[key];
    const signupSourceOwner = this.signupSource ? this : source;

    return new User({
      ...this,
      email: pick(selection.email, 'email'),
      firstName: pick(selection.firstName, 'firstName'),
      lastName: pick(selection.lastName, 'lastName'),
      birthday: pick(selection.birthday, 'birthday'),
      pictureUrl: pick(selection.picture, 'pictureUrl'),
      signupSource: signupSourceOwner.signupSource,
      signupSourceDetail: signupSourceOwner.signupSourceDetail,
      updatedAt: new Date(),
    });
  }

  grantAdmin(): User {
    if (this.isSuperAdmin() || this.authorities.includes(Authorities.ROLE_ADMIN)) {
      return this;
    }

    return new User({
      ...this,
      authorities: [Authorities.ROLE_ADMIN],
      updatedAt: new Date(),
    });
  }

  revokeAdmin(): User {
    if (this.isSuperAdmin() || !this.authorities.includes(Authorities.ROLE_ADMIN)) {
      return this;
    }

    return new User({
      ...this,
      authorities: [Authorities.ROLE_USER],
      updatedAt: new Date(),
    });
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

  updateSignupSource(params: { source: SignupSource; detail?: string }): User {
    return new User({
      ...this,
      signupSource: params.source,
      signupSourceDetail: params.source === SignupSource.OTHER ? params.detail : undefined,
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
