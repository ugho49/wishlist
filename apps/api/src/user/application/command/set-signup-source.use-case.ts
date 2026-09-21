import type { UserRepository } from '../../domain/repository/user.repository';
import type { SignupSource } from '../../domain/signup-source.enum';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type SetSignupSourceInput = {
  userId: UserId;
  source: SignupSource;
  detail?: string;
};

@Injectable()
export class SetSignupSourceUseCase {
  private readonly logger = new Logger(SetSignupSourceUseCase.name);

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: SetSignupSourceInput): Promise<void> {
    const { userId, source, detail } = input;
    this.logger.log('Setting signup source...', { userId, source });

    const user = await this.userRepository.findByIdOrFail(userId);
    const updatedUser = user.updateSignupSource({ source, detail });

    await this.userRepository.save(updatedUser);
  }
}
