import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { MiniUserDto } from '@wishlist/common'

import { User, UserCreatedEvent, UserRepository } from '../../domain'
import { userMapper } from '../../infrastructure'

export type CreateUserInput = {
  newUser: {
    firstname: string
    lastname: string
    email: string
    password: string
  }
  ip: string
}

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name)

  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(input: CreateUserInput): Promise<MiniUserDto> {
    this.logger.log('Create user request received', {
      payload: {
        email: input.newUser.email,
        firstname: input.newUser.firstname,
        lastname: input.newUser.lastname,
      },
    })

    const { newUser, ip } = input

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
