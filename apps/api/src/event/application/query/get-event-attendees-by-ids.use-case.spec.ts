import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetEventAttendeesByIdsUseCase } from './get-event-attendees-by-ids.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetEventAttendeesByIdsUseCase', () => {
  const eventAttendeeRepository = createMock<EventAttendeeRepository>();
  let useCase: GetEventAttendeesByIdsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetEventAttendeesByIdsUseCase(eventAttendeeRepository);
  });

  it('should return attendees matching the given ids', async () => {
    const event = new EventBuilder().withCreator(new UserBuilder().build()).build();
    eventAttendeeRepository.findByIds.mockResolvedValueOnce(event.attendees);

    const result = await useCase.execute({ attendeeIds: event.attendees.map(attendee => attendee.id) });

    expect(result).toEqual(event.attendees);
  });
});
