import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';

import { REPOSITORIES } from '../../repositories/repositories.constants';
import { type UserSessionRepository } from '../domain/repository/user-session.repository';

@Injectable()
export class UserSessionDeviceBackfill implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserSessionDeviceBackfill.name);

  constructor(
    @Inject(REPOSITORIES.USER_SESSION)
    private readonly sessionRepository: UserSessionRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const sessions = await this.sessionRepository.findNeedingDeviceBackfill();

    if (sessions.length === 0) {
      return;
    }

    this.logger.log(`Backfilling parsed device for ${sessions.length} user session(s)`);

    for (const session of sessions) {
      await this.sessionRepository.save(session.withParsedDevice());
    }
  }
}
