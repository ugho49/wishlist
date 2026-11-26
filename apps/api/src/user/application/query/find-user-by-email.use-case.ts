import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';

export type FindUserByEmailInput = {
  currentUser: ICurrentUser;
  /** Already lower-cased by the GraphQL schema */
  email: string;
};

export type FindUserByEmailOutput = {
  user?: User;
};

/**
 * Finds an account by its exact email, to show who is being invited. It tells whether an email has
 * an account and reveals its name: the `userByEmail` field is rate limited (`@RateLimit`).
 */
@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: FindUserByEmailInput): Promise<FindUserByEmailOutput> {
    const { currentUser, email } = input;

    const user = await this.userRepository.findByEmail(email);

    if (!user?.isEnabled || user.id === currentUser.id) {
      return { user: undefined };
    }

    return { user };
  }
}
