import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { EventBus } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { DateTime } from 'luxon'

import {
  PasswordVerificationCreatedEvent,
  UserPasswordVerification,
  UserPasswordVerificationRepository,
  UserRepository,
} from '../../domain'
import userConfig from '../../infrastructure/user.config'

export type CreatePasswordVerificationInput = {
  email: string
}

@Injectable()
export class CreatePasswordVerificationUseCase {
  private readonly logger = new Logger(CreatePasswordVerificationUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_PASSWORD_VERIFICATION)
    private readonly verificationEntityRepository: UserPasswordVerificationRepository,
    @Inject(userConfig.KEY)
    private readonly config: ConfigType<typeof userConfig>,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: CreatePasswordVerificationInput): Promise<void> {
    this.logger.log('Create password verification request received', { input })

    const user = await this.userRepository.findByEmail(input.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const previousValidPasswordValidations = await this.verificationEntityRepository.findByUserId(user.id)
    const hasValidPasswordValidation = previousValidPasswordValidations.some(validation => !validation.isExpired())

    if (hasValidPasswordValidation) {
      throw new UnauthorizedException('A reset email has already been send, please retry later')
    }

    const passwordVerification = UserPasswordVerification.create({
      id: this.verificationEntityRepository.newId(),
      user,
      expiredAt: DateTime.now().plus({ minute: this.config.resetPasswordTokenDurationInMinutes }).toJSDate(),
    })

    this.logger.log('Saving password verification...', { userId: user.id, passwordVerification })
    await this.verificationEntityRepository.save(passwordVerification)

    this.eventBus.publish(
      new PasswordVerificationCreatedEvent({ email: user.email, token: passwordVerification.token }),
    )
  }
}
