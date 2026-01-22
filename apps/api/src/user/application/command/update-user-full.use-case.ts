import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PasswordManager } from '@wishlist/api/auth'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser, UserId } from '@wishlist/common'

import { UserRepository } from '../../domain'

export type UpdateUserFullInput = {
  userId: UserId
  currentUser: ICurrentUser
  updateUser: {
    email?: string
    newPassword?: string
    firstname?: string
    lastname?: string
    birthday?: Date
    isEnabled?: boolean
  }
}

@Injectable()
export class UpdateUserFullUseCase {
  private readonly logger = new Logger(UpdateUserFullUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: UpdateUserFullInput): Promise<void> {
    this.logger.log('Update user full request received', { userId: input.userId })
    const { userId, currentUser, updateUser } = input

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
