import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { EmailChangedEvent, UserEmailChangeVerificationRepository, UserRepository } from '../../domain'

export type ConfirmEmailChangeInput = {
  newEmail: string
  token: string
}

@Injectable()
export class ConfirmEmailChangeUseCase {
  private readonly logger = new Logger(ConfirmEmailChangeUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_EMAIL_CHANGE_VERIFICATION)
    private readonly emailChangeVerificationRepository: UserEmailChangeVerificationRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: ConfirmEmailChangeInput): Promise<void> {
    this.logger.log('Confirm email change request received', { input })
    // Normalize email to lowercase
    const newEmail = input.newEmail.toLowerCase()

    // Find the verification by token and email
    const verification = await this.emailChangeVerificationRepository.findByTokenAndEmail(input.token, newEmail)

    if (!verification) {
      throw new UnauthorizedException('This email change verification is not valid')
    }

    if (verification.isExpired()) {
      throw new UnauthorizedException('This email change verification has expired')
    }

    // Check if the new email is still available
    const existingUser = await this.userRepository.findByEmail(newEmail)
    if (existingUser && existingUser.id !== verification.user.id) {
      throw new UnauthorizedException('This email is already in use by another user')
    }

    const oldEmail = verification.user.email
    const updatedUser = verification.user.updateEmail(newEmail)
    const invalidatedVerification = verification.invalidate()

    this.logger.log('Updating user email and invalidating verification...', {
      userId: updatedUser.id,
      oldEmail,
      newEmail,
    })
    // Update user email and invalidate verification in a transaction
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(updatedUser, tx)
      await this.emailChangeVerificationRepository.save(invalidatedVerification, tx)
    })

    // Publish event to notify of email change
    this.eventBus.publish(
      new EmailChangedEvent({
        userId: updatedUser.id,
        oldEmail,
        newEmail,
      }),
    )
  }
}
