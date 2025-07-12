import { Global, Module } from '@nestjs/common'

import { PostgresAttendeeRepository } from './attendee.repository'
import { PostgresEventRepository } from './event.repository'
import * as tokens from './repositories.tokens'
import { PostgresSecretSantaUserRepository } from './secret-santa-user.repository'
import { PostgresSecretSantaRepository } from './secret-santa.repository'

@Global()
@Module({
  providers: [
    {
      provide: tokens.ATTENDEE_REPOSITORY,
      useClass: PostgresAttendeeRepository,
    },
    {
      provide: tokens.EVENT_REPOSITORY,
      useClass: PostgresEventRepository,
    },
    {
      provide: tokens.SECRET_SANTA_REPOSITORY,
      useClass: PostgresSecretSantaRepository,
    },
    {
      provide: tokens.SECRET_SANTA_USER_REPOSITORY,
      useClass: PostgresSecretSantaUserRepository,
    },
  ],
  exports: [
    tokens.ATTENDEE_REPOSITORY,
    tokens.EVENT_REPOSITORY,
    tokens.SECRET_SANTA_REPOSITORY,
    tokens.SECRET_SANTA_USER_REPOSITORY,
  ],
})
export class RepositoriesModule {}
