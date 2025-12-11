import { Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { DeleteUserCommand, UserRepository } from '../../domain'

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements IInferredCommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    this.logger.log('Delete user request received', { command })
    const { userId, currentUser } = command

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
