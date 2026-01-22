import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { PasswordManager } from '@wishlist/api/auth'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserId } from '@wishlist/common'

import { UserRepository } from '../../domain'

export type UpdateUserPasswordInput = {
  userId: UserId
  oldPassword: string
  newPassword: string
}

@Injectable()
export class UpdateUserPasswordUseCase {
  private readonly logger = new Logger(UpdateUserPasswordUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserPasswordInput): Promise<void> {
    this.logger.log('Update user password request received', { userId: input.userId })
    const { userId, oldPassword, newPassword } = input

    const user = await this.userRepository.findByIdOrFail(userId)
    const oldPasswordMatch = await PasswordManager.verify({
      hash: user.passwordEnc ?? undefined,
      plainPassword: oldPassword,
    })

    if (!oldPasswordMatch) {
      throw new BadRequestException("Old password don't match with user password")
    }

    const newPasswordHash = await PasswordManager.hash(newPassword)
    const updatedUser = user.updatePassword(newPasswordHash)

    this.logger.log('Saving user...', { userId, updatedFields: ['password'] })
    await this.userRepository.save(updatedUser)
  }
}
