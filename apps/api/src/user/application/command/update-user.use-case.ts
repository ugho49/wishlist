import type { UserRepository } from '../../domain/repository/user.repository';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

export type UpdateUserInput = {
  userId: UserId;
  updateUser: {
    firstname: string;
    lastname: string;
    birthday?: Date;
  };
};

@Injectable()
export class UpdateUserUseCase {
  private readonly logger = getLogger(UpdateUserUseCase.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    this.logger.info('Update user request received', { input });
    const { userId, updateUser } = input;

    const user = await this.userRepository.findByIdOrFail(userId);

    const updatedUser = user
      .updateFirstName(updateUser.firstname)
      .updateLastName(updateUser.lastname)
      .updateBirthday(updateUser.birthday);

    this.logger.info('Updating user...', { userId, updatedFields: ['firstname', 'lastname', 'birthday'] });
    await this.userRepository.save(updatedUser);
  }
}
