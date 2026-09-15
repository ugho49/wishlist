import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetAdminEventsStatsOutput = {
  totalCount: number;
  upcomingCount: number;
  pastCount: number;
};

@Injectable()
export class GetAdminEventsStatsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  execute(): Promise<GetAdminEventsStatsOutput> {
    return this.eventRepository.countAdminStats();
  }
}
