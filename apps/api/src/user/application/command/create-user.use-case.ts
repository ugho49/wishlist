import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { PasswordManager } from '@wishlist/api/auth'
import { TransactionManager } from '@wishlist/api/core'
import { EventAttendeeRepository } from '@wishlist/api/event'
import { EVENT_ATTENDEE_REPOSITORY, USER_EMAIL_SETTING_REPOSITORY, USER_REPOSITORY } from '@wishlist/api/repositories'

import {
  CreateUserCommand,
  CreateUserResult,
  User,
  UserCreatedEvent,
  UserEmailSetting,
  UserEmailSettingRepository,
  UserRepository,
} from '../../domain'
import { userMapper } from '../../infrastructure'

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements IInferredCommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_EMAIL_SETTING_REPOSITORY)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
    @Inject(EVENT_ATTENDEE_REPOSITORY)
    private readonly eventAttendeeRepository: EventAttendeeRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
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

    const settings = UserEmailSetting.create({ id: this.userEmailSettingRepository.newId(), user })

    const eventAttendeeByUserEmail = await this.eventAttendeeRepository
      .findByTempEmail(newUser.email)
      .then(attendees => attendees.map(attendee => attendee.convertTemporaryAttendeeToUser(user)))

    await this.transactionManager.runInTransaction(async tx => {
      await this.userRepository.save(user, tx)
      await this.userEmailSettingRepository.save(settings, tx)

      for (const attendee of eventAttendeeByUserEmail) {
        await this.eventAttendeeRepository.save(attendee, tx)
      }
    })

    await this.eventBus.publish(new UserCreatedEvent({ user }))

    return userMapper.toMiniUserDto(user)
  }
}
