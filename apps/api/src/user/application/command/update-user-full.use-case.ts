import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UpdateUserFullCommand, UserRepository } from '../../domain'

@CommandHandler(UpdateUserFullCommand)
export class UpdateUserFullUseCase implements IInferredCommandHandler<UpdateUserFullCommand> {
  private readonly logger = new Logger(UpdateUserFullUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserFullCommand): Promise<void> {
    this.logger.log('Update user full request received', { userId: command.userId })
    const { userId, currentUser, updateUser } = command

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot update yourself')
    }

    let user = await this.userRepository.findByIdOrFail(userId)
    const canUpdateUser = (currentUser.isSuperAdmin && !user.isSuperAdmin()) || !user.isAdmin()

    if (!canUpdateUser) {
      throw new UnauthorizedException('You cannot update this user')
    }

    const updatedFields: string[] = []

    if (updateUser.email && user.email !== updateUser.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(updateUser.email)

      if (userWithSameEmail) {
        throw new BadRequestException('A user already exist with this email')
      }

      user = user.updateEmail(updateUser.email)
      updatedFields.push('email')
    }

    if (updateUser.newPassword) {
      user = user.updatePassword(await PasswordManager.hash(updateUser.newPassword))
      updatedFields.push('password')
    }

    if (updateUser.firstname) {
      user = user.updateFirstName(updateUser.firstname)
      updatedFields.push('firstname')
    }

    if (updateUser.lastname) {
      user = user.updateLastName(updateUser.lastname)
      updatedFields.push('lastname')
    }

    if (updateUser.birthday) {
      user = user.updateBirthday(updateUser.birthday)
      updatedFields.push('birthday')
    }

    if (updateUser.isEnabled !== undefined) {
      user = user.updateIsEnabled(updateUser.isEnabled)
      updatedFields.push('isEnabled')
    }

    this.logger.log('Updating user...', { userId, updatedFields })
    await this.userRepository.save(user)
  }
}
