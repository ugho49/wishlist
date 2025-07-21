import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
import { TransactionManager } from '@wishlist/api/core'
import { USER_PASSWORD_VERIFICATION_REPOSITORY, USER_REPOSITORY } from '@wishlist/api/repositories'

import { ResetUserPasswordCommand, UserPasswordVerificationRepository, UserRepository } from '../../domain'

@CommandHandler(ResetUserPasswordCommand)
export class ResetUserPasswordUseCase implements IInferredCommandHandler<ResetUserPasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_PASSWORD_VERIFICATION_REPOSITORY)
    private readonly passwordVerificationRepository: UserPasswordVerificationRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: ResetUserPasswordCommand): Promise<void> {
    const user = await this.userRepository.findByEmail(command.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const passwordVerifications = await this.passwordVerificationRepository.findByUserId(user.id)

    const passwordVerification = passwordVerifications.find(verification => verification.token === command.token)

    if (!passwordVerification) {
      throw new UnauthorizedException('This reset code is not valid')
    }

    if (passwordVerification.isExpired()) {
      throw new UnauthorizedException('This reset code is expired')
    }

    const newPasswordEncoded = await PasswordManager.hash(command.newPassword)
    const updatedUser = user.updatePassword(newPasswordEncoded)

    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(updatedUser, tx)
      await this.passwordVerificationRepository.delete(passwordVerification.id, tx)
    })
  }
}
