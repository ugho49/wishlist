import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
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
    const currentUser = await this.userRepository.findByIdOrFail(command.currentUser.id)

    // Verify password if user has one (email/password authentication)
    if (currentUser.passwordEnc) {
      // User has a password, so password verification is required
      if (!command.password) {
        throw new UnauthorizedException('Password is required for users with email/password authentication')
      }

      const passwordVerified = await PasswordManager.verify({
        hash: currentUser.passwordEnc,
        plainPassword: command.password,
      })

      if (!passwordVerified) {
        throw new UnauthorizedException('Incorrect password')
      }
    }
    // If user has no password (Google-only authentication), skip password verification

    // Normalize email to lowercase
    const newEmail = command.newEmail.toLowerCase()

    // Check if the new email is the same as the current email
    if (currentUser.email.toLowerCase() === newEmail) {
      throw new BadRequestException('New email cannot be the same as current email')
    }

    // Check if the new email is already taken by another user
    const existingUser = await this.userRepository.findByEmail(newEmail)
    if (existingUser) {
      throw new BadRequestException('This email is already in use')
    }

    // Check if there's already a pending verification for this user
    const previousVerifications = await this.emailChangeVerificationRepository.findByUserId(currentUser.id)
    const hasActiveVerification = previousVerifications.some(verification => !verification.isExpired())

    if (hasActiveVerification) {
      throw new UnauthorizedException('An email change request is already pending, please retry later')
    }

    // Create the email change verification
    const emailChangeVerification = UserEmailChangeVerification.create({
      id: this.emailChangeVerificationRepository.newId(),
      user: currentUser,
      newEmail,
      expiredAt: DateTime.now().plus({ minute: this.config.emailChangeVerificationTokenDurationInMinutes }).toJSDate(),
    })

    await this.emailChangeVerificationRepository.save(emailChangeVerification)

    // Publish event to send notification emails
    this.eventBus.publish(
      new EmailChangeVerificationCreatedEvent({
        oldEmail: currentUser.email,
        newEmail,
        token: emailChangeVerification.token,
      }),
    )
  }
}
