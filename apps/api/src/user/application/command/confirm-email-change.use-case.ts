import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import {
  ConfirmEmailChangeCommand,
  EmailChangedEvent,
  UserEmailChangeVerificationRepository,
  UserRepository,
} from '../../domain'

@CommandHandler(ConfirmEmailChangeCommand)
export class ConfirmEmailChangeUseCase implements IInferredCommandHandler<ConfirmEmailChangeCommand> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_EMAIL_CHANGE_VERIFICATION)
    private readonly emailChangeVerificationRepository: UserEmailChangeVerificationRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ConfirmEmailChangeCommand): Promise<void> {
    // Normalize email to lowercase
    const newEmail = command.newEmail.toLowerCase()

    // Find the verification by token and email
    const verification = await this.emailChangeVerificationRepository.findByTokenAndEmail(command.token, newEmail)

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

    // Update user email and delete verification in a transaction
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(updatedUser, tx)
      await this.emailChangeVerificationRepository.delete(verification.id, tx)
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
