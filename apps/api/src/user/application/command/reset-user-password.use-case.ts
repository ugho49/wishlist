import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { PasswordManager } from '@wishlist/api/auth'
import { TransactionManager } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UserPasswordVerificationRepository, UserRepository } from '../../domain'

export type ResetUserPasswordInput = {
  email: string
  token: string
  newPassword: string
}

@Injectable()
export class ResetUserPasswordUseCase {
  private readonly logger = new Logger(ResetUserPasswordUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_PASSWORD_VERIFICATION)
    private readonly passwordVerificationRepository: UserPasswordVerificationRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: ResetUserPasswordInput): Promise<void> {
    this.logger.log('Reset user password request received', { email: input.email, token: input.token })
    const user = await this.userRepository.findByEmail(input.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const passwordVerifications = await this.passwordVerificationRepository.findByUserId(user.id)

    const passwordVerification = passwordVerifications.find(verification => verification.token === input.token)

    if (!passwordVerification) {
      throw new UnauthorizedException('This reset code is not valid')
    }

    if (passwordVerification.isExpired()) {
      throw new UnauthorizedException('This reset code is expired')
    }

    const newPasswordEncoded = await PasswordManager.hash(input.newPassword)
    const updatedUser = user.updatePassword(newPasswordEncoded)

    this.logger.log('Saving user and deleting password verification...', { userId: user.id })
    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(updatedUser, tx)
      await this.passwordVerificationRepository.delete(passwordVerification.id, tx)
    })
  }
}
