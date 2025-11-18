import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { DateTime } from 'luxon'

import {
  CreateEmailChangeVerificationCommand,
  EmailChangeVerificationCreatedEvent,
  UserEmailChangeVerification,
  UserEmailChangeVerificationRepository,
  UserRepository,
} from '../../domain'
import userConfig from '../../infrastructure/user.config'

@CommandHandler(CreateEmailChangeVerificationCommand)
export class CreateEmailChangeVerificationUseCase
  implements IInferredCommandHandler<CreateEmailChangeVerificationCommand>
{
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_EMAIL_CHANGE_VERIFICATION)
    private readonly emailChangeVerificationRepository: UserEmailChangeVerificationRepository,
    @Inject(userConfig.KEY)
    private readonly config: ConfigType<typeof userConfig>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateEmailChangeVerificationCommand): Promise<void> {
    // Get the current user
    const user = await this.userRepository.findById(command.currentUser.id)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // Normalize email to lowercase
    const newEmail = command.newEmail.toLowerCase()

    // Check if the new email is the same as the current email
    if (user.email.toLowerCase() === newEmail) {
      throw new BadRequestException('New email cannot be the same as current email')
    }

    // Check if the new email is already taken by another user
    const existingUser = await this.userRepository.findByEmail(newEmail)
    if (existingUser) {
      throw new BadRequestException('This email is already in use')
    }

    // Check if there's already a pending verification for this user
    const previousVerifications = await this.emailChangeVerificationRepository.findByUserId(user.id)
    const hasActiveVerification = previousVerifications.some(verification => !verification.isExpired())

    if (hasActiveVerification) {
      throw new UnauthorizedException('An email change request is already pending, please retry later')
    }

    // Create the email change verification
    const emailChangeVerification = UserEmailChangeVerification.create({
      id: this.emailChangeVerificationRepository.newId(),
      user,
      newEmail,
      expiredAt: DateTime.now().plus({ minute: this.config.resetPasswordTokenDurationInMinutes }).toJSDate(),
    })

    await this.emailChangeVerificationRepository.save(emailChangeVerification)

    // Publish event to send notification emails
    this.eventBus.publish(
      new EmailChangeVerificationCreatedEvent({
        oldEmail: user.email,
        newEmail,
        token: emailChangeVerification.token,
      }),
    )
  }
}
