import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

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
  private readonly logger = new Logger(UpdateUserUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserInput): Promise<void> {
    this.logger.log('Update user request received', { input });
    const { userId, updateUser } = input;

    const user = await this.userRepository.findByIdOrFail(userId);

    const updatedUser = user
      .updateFirstName(updateUser.firstname)
      .updateLastName(updateUser.lastname)
      .updateBirthday(updateUser.birthday);

    this.logger.log('Updating user...', { userId, updatedFields: ['firstname', 'lastname', 'birthday'] });
    await this.userRepository.save(updatedUser);
  }
}
