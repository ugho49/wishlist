import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser, UserId } from '@wishlist/common'

import { UserRepository } from '../../domain'

export type DeleteUserInput = {
  currentUser: ICurrentUser
  userId: UserId
}

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: DeleteUserInput): Promise<void> {
    this.logger.log('Delete user request received', { input })
    const { userId, currentUser } = input

    if (userId === currentUser.id) {
      throw new UnauthorizedException('You cannot delete yourself')
    }

    const userToDelete = await this.userRepository.findByIdOrFail(userId)

    const canDeleteUser = (currentUser.isSuperAdmin && !userToDelete.isSuperAdmin()) || !userToDelete.isAdmin()

    if (!canDeleteUser) {
      throw new UnauthorizedException('You cannot delete this user')
    }

    this.logger.log('Deleting user...', { userId })
    await this.userRepository.delete(userId)
  }
}
