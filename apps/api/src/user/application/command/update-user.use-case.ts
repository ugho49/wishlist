import { Inject, Logger } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UpdateUserCommand, UserRepository } from '../../domain'

@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements IInferredCommandHandler<UpdateUserCommand> {
  private readonly logger = new Logger(UpdateUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    this.logger.log('Update user request received', { command })
    const { userId, updateUser } = command

    const user = await this.userRepository.findByIdOrFail(userId)

    const updatedUser = user
      .updateFirstName(updateUser.firstname)
      .updateLastName(updateUser.lastname)
      .updateBirthday(updateUser.birthday)

    this.logger.log('Updating user...', { userId, updatedFields: ['firstname', 'lastname', 'birthday'] })
    await this.userRepository.save(updatedUser)
  }
}
