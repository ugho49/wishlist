import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserEmailChangeVerificationRepository } from '../../domain/repository/user-email-change-verification.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { BadRequestException, UnauthorizedException } from '@znight/http';
import { DateTime } from 'luxon';

import { EmailChangeVerificationCreatedEvent } from '../../domain/event/email-change-verification-created.event';
import { UserEmailChangeVerification } from '../../domain/model/user-email-change-verification.model';
import { UserConfig } from '../../infrastructure/user.config';

export type CreateEmailChangeVerificationInput = {
  currentUser: ICurrentUser;
  newEmail: string;
};

@Injectable()
export class CreateEmailChangeVerificationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailChangeVerificationRepository: UserEmailChangeVerificationRepository,
    private readonly config: UserConfig,
    private readonly eventBus: EventPublisher,
  ) {}

  async execute(input: CreateEmailChangeVerificationInput): Promise<void> {
    const currentUser = await this.userRepository.findByIdOrFail(input.currentUser.id);

    // Normalize email to lowercase
    const newEmail = input.newEmail.toLowerCase();

    // Check if the new email is the same as the current email
    if (currentUser.email.toLowerCase() === newEmail) {
      throw new BadRequestException('New email cannot be the same as current email');
    }

    // Check if the new email is already taken by another user
    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser) {
      throw new BadRequestException('This email is already in use');
    }

    // Check if there's already a pending verification for this user
    const previousVerifications = await this.emailChangeVerificationRepository.findByUserId(currentUser.id);
    const hasActiveVerification = previousVerifications.some(verification => !verification.isExpired());

    if (hasActiveVerification) {
      throw new UnauthorizedException('An email change request is already pending, please retry later');
    }

    // Create the email change verification
    const emailChangeVerification = UserEmailChangeVerification.create({
      id: this.emailChangeVerificationRepository.newId(),
      user: currentUser,
      newEmail,
      expiredAt: DateTime.now().plus({ minute: this.config.emailChangeVerificationTokenDurationInMinutes }).toJSDate(),
    });

    await this.emailChangeVerificationRepository.save(emailChangeVerification);

    // Publish event to send notification emails
    await this.eventBus.publish(
      new EmailChangeVerificationCreatedEvent({
        userId: currentUser.id,
        oldEmail: currentUser.email,
        newEmail,
        token: emailChangeVerification.token,
      }),
    );
  }
}
