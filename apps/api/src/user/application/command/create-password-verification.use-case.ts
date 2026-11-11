import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserPasswordVerificationRepository } from '../../domain/repository/user-password-verification.repository';

import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { NotFoundException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';
import { DateTime } from 'luxon';

import { PasswordVerificationCreatedEvent } from '../../domain/event/password-verification-created.event';
import { UserPasswordVerification } from '../../domain/model/user-password-verification.model';
import { UserConfig } from '../../infrastructure/user.config';

export type CreatePasswordVerificationInput = {
  email: string;
};

@Injectable()
export class CreatePasswordVerificationUseCase {
  private readonly logger = getLogger(CreatePasswordVerificationUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationEntityRepository: UserPasswordVerificationRepository,
    private readonly config: UserConfig,
    private readonly eventBus: EventPublisher,
  ) {}

  async execute(input: CreatePasswordVerificationInput): Promise<void> {
    this.logger.info('Create password verification request received', { input });

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const previousValidPasswordValidations = await this.verificationEntityRepository.findByUserId(user.id);
    const hasValidPasswordValidation = previousValidPasswordValidations.some(validation => !validation.isExpired());

    if (hasValidPasswordValidation) {
      throw new UnauthorizedException('A reset email has already been send, please retry later');
    }

    const passwordVerification = UserPasswordVerification.create({
      id: this.verificationEntityRepository.newId(),
      user,
      expiredAt: DateTime.now().plus({ minute: this.config.resetPasswordTokenDurationInMinutes }).toJSDate(),
    });

    this.logger.info('Saving password verification...', { userId: user.id, passwordVerification });
    await this.verificationEntityRepository.save(passwordVerification);

    await this.eventBus.publish(
      new PasswordVerificationCreatedEvent({ email: user.email, token: passwordVerification.token }),
    );
  }
}
