import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserPasswordVerificationRepository } from '../../domain/repository/user-password-verification.repository';

import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { getLogger } from '@znight/observability';
import { DateTime } from 'luxon';

import { PasswordResetRequestedEvent } from '../../domain/event/password-reset-requested.event';
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

  /**
   * Answers the same way whether the email has an account or not, so that the caller cannot learn
   * it: no error for an unknown email, nor for a reset already asked (its code is sent again). The
   * `resetPasswordEmail` rate limit caps the emails one address can receive.
   */
  async execute(input: CreatePasswordVerificationInput): Promise<void> {
    this.logger.info('Create password verification request received', { email: input.email });

    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      this.logger.info('No account for this email, no reset password email sent', { email: input.email });
      return;
    }

    const verifications = await this.verificationEntityRepository.findByUserId(user.id);
    const pendingVerification = verifications
      .filter(verification => !verification.isExpired())
      .sort((a, b) => b.expiredAt.getTime() - a.expiredAt.getTime())[0];

    if (pendingVerification) {
      // The first email may be lost: send its still valid code again rather than a new one
      this.logger.info('Sending the pending reset password code again', { userId: user.id });
      await this.eventBus.publish(
        new PasswordResetRequestedEvent({ email: user.email, token: pendingVerification.token }),
      );
      return;
    }

    const passwordVerification = UserPasswordVerification.create({
      id: this.verificationEntityRepository.newId(),
      user,
      expiredAt: DateTime.now().plus({ minute: this.config.resetPasswordTokenDurationInMinutes }).toJSDate(),
    });

    this.logger.info('Saving password verification...', { userId: user.id });
    await this.verificationEntityRepository.save(passwordVerification);

    await this.eventBus.publish(
      new PasswordResetRequestedEvent({ email: user.email, token: passwordVerification.token }),
    );
  }
}
