import { BadRequestException, Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UpdateUserPasswordCommand, UserRepository } from '../../domain'

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordUseCase implements IInferredCommandHandler<UpdateUserPasswordCommand> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const { userId, oldPassword, newPassword } = command

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

    await this.userRepository.save(updatedUser)
  }
}
