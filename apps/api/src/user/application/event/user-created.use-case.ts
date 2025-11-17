import { Inject, Logger } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { appConfig, MailService, TransactionManager } from '@wishlist/api/core'
import { EventAttendeeRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UserCreatedEvent, UserEmailSetting, UserEmailSettingRepository } from '../../domain'

@EventsHandler(UserCreatedEvent)
export class UserCreatedUseCase implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedUseCase.name)

  constructor(
    private readonly mailService: MailService,
    @Inject(REPOSITORIES.USER_EMAIL_SETTING)
    private readonly userEmailSettingRepository: UserEmailSettingRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE)
    private readonly eventAttendeeRepository: EventAttendeeRepository,
    private readonly transactionManager: TransactionManager,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
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
          mainUrl: `${this.config.frontendBaseUrl}/`,
        },
      })
    } catch (error) {
      this.logger.error('Fail to send welcome mail to user', error)
    }
  }
}
