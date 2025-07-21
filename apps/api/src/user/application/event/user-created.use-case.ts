import { Inject, Logger } from '@nestjs/common'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { MailService, TransactionManager } from '@wishlist/api/core'
import { EventAttendeeRepository } from '@wishlist/api/event'
import { EVENT_ATTENDEE_REPOSITORY, USER_EMAIL_SETTING_REPOSITORY } from '@wishlist/api/repositories'

import { UserCreatedEvent, UserEmailSetting, UserEmailSettingRepository } from '../../domain'

@EventsHandler(UserCreatedEvent)
export class UserCreatedUseCase implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedUseCase.name)

  constructor(
    private readonly mailService: MailService,
    @Inject(USER_EMAIL_SETTING_REPOSITORY)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
    @Inject(EVENT_ATTENDEE_REPOSITORY)
    private readonly eventAttendeeRepository: EventAttendeeRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async handle(params: UserCreatedEvent) {
    const settings = UserEmailSetting.create({ id: this.userEmailSettingRepository.newId(), user: params.user })

    const eventAttendeeByUserEmail = await this.eventAttendeeRepository
      .findByTempEmail(params.user.email)
      .then(attendees => attendees.map(attendee => attendee.convertTemporaryAttendeeToUser(params.user)))

    await this.transactionManager.runInTransaction(async tx => {
      await this.userEmailSettingRepository.save(settings, tx)

      for (const attendee of eventAttendeeByUserEmail) {
        await this.eventAttendeeRepository.save(attendee, tx)
      }
    })

    try {
      await this.mailService.sendMail({
        to: params.user.email,
        subject: '[Wishlist] Bienvenue !!!',
        template: 'welcome-user',
        context: {
          mainUrl: 'https://wishlistapp.fr/',
        },
      })
    } catch (error) {
      this.logger.error('Fail to send welcome mail to user', error)
    }
  }
}
