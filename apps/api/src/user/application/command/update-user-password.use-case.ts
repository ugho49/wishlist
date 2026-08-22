import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type UpdateUserPasswordInput = {
  userId: UserId;
  oldPassword: string;
  newPassword: string;
};

@Injectable()
export class UpdateUserPasswordUseCase {
  private readonly logger = new Logger(UpdateUserPasswordUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserPasswordInput): Promise<void> {
    this.logger.log('Update user password request received', { userId: input.userId });
    const { userId, oldPassword, newPassword } = input;

    const user = await this.userRepository.findByIdOrFail(userId);
    const oldPasswordMatch = await PasswordManager.verify({
      hash: user.passwordEnc ?? undefined,
      plainPassword: oldPassword,
    });

    if (!oldPasswordMatch) {
      throw new BusinessRuleException('WRONG_OLD_PASSWORD', "Old password don't match with user password");
    }

    const newPasswordHash = await PasswordManager.hash(newPassword);
    const updatedUser = user.updatePassword(newPasswordHash);

    this.logger.log('Saving user...', { userId, updatedFields: ['password'] });
    await this.userRepository.save(updatedUser);
  }
}
