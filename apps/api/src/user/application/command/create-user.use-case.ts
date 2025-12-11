import { Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { CreateUserCommand, CreateUserResult, User, UserCreatedEvent, UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements IInferredCommandHandler<CreateUserCommand> {
  private readonly logger = new Logger(CreateUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    this.logger.log('Create user request received', {
      payload: {
        email: command.newUser.email,
        firstname: command.newUser.firstname,
        lastname: command.newUser.lastname,
      },
    })

    const { newUser, ip } = command

    if (await this.userRepository.findByEmail(newUser.email)) {
      throw new UnauthorizedException('User email already taken')
    }

    const user = User.create({
      id: this.userRepository.newId(),
      email: newUser.email,
      firstName: newUser.firstname,
      lastName: newUser.lastname,
      passwordEnc: newUser.password ? await PasswordManager.hash(newUser.password) : undefined,
      ip,
    })

    this.logger.log('Creating user...', { userId: user.id })
    await this.userRepository.save(user)

    await this.eventBus.publish(new UserCreatedEvent({ user }))

    return userMapper.toMiniUserDto(user)
  }
}
