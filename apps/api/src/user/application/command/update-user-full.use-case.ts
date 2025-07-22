import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UpdateUserFullCommand, UserRepository } from '../../domain'

@CommandHandler(UpdateUserFullCommand)
export class UpdateUserFullUseCase implements IInferredCommandHandler<UpdateUserFullCommand> {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserFullCommand): Promise<void> {
    const { userId, currentUser, updateUser } = command

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot update yourself')
    }

    let user = await this.userRepository.findByIdOrFail(userId)
    const canUpdateUser = (currentUser.isSuperAdmin && !user.isSuperAdmin()) || !user.isAdmin()

    if (!canUpdateUser) {
      throw new UnauthorizedException('You cannot update this user')
    }

    if (updateUser.email && user.email !== updateUser.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(updateUser.email)

      if (userWithSameEmail) {
        throw new BadRequestException('A user already exist with this email')
      }

      user = user.updateEmail(updateUser.email)
    }

    if (updateUser.newPassword) {
      user = user.updatePassword(await PasswordManager.hash(updateUser.newPassword))
    }

    if (updateUser.firstname) {
      user = user.updateFirstName(updateUser.firstname)
    }

    if (updateUser.lastname) {
      user = user.updateLastName(updateUser.lastname)
    }

    if (updateUser.birthday) {
      user = user.updateBirthday(updateUser.birthday)
    }

    if (updateUser.isEnabled !== undefined) {
      user = user.updateIsEnabled(updateUser.isEnabled)
    }

    await this.userRepository.save(user)
  }
}
