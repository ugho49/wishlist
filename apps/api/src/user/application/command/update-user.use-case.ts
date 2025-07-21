import { Inject } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { USER_REPOSITORY } from '@wishlist/api/repositories'

import { UpdateUserCommand, UserRepository } from '../../domain'

@CommandHandler(UpdateUserCommand)
export class UpdateUserUseCase implements IInferredCommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const { userId, updateUser } = command

    const user = await this.userRepository.findByIdOrFail(userId)

    const updatedUser = user
      .updateFirstName(updateUser.firstname)
      .updateLastName(updateUser.lastname)
      .updateBirthday(updateUser.birthday)

    await this.userRepository.save(updatedUser)
  }
}
