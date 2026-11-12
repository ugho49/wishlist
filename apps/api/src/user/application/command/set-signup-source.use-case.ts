import type { UserRepository } from '../../domain/repository/user.repository';
import type { SignupSource } from '../../domain/signup-source.enum';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

export type SetSignupSourceInput = {
  userId: UserId;
  source: SignupSource;
  detail?: string;
};

@Injectable()
export class SetSignupSourceUseCase {
  private readonly logger = getLogger(SetSignupSourceUseCase.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: SetSignupSourceInput): Promise<void> {
    const { userId, source, detail } = input;
    this.logger.info('Setting signup source...', { userId, source });

    const user = await this.userRepository.findByIdOrFail(userId);
    const updatedUser = user.updateSignupSource({ source, detail });

    await this.userRepository.save(updatedUser);
  }
}
