import type { EventAttendeeRepository } from '../../../event/domain/repository/event-attendee.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { EventAttendee } from '../../../event/domain/model/event-attendee.model';
import { User } from '../../../user/domain/model/user.model';
import { SecretSantaUser } from '../../domain/model/secret-santa-user.model';
import { GetSecretSantaDrawUseCase } from './get-secret-santa-draw.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetSecretSantaDrawUseCase', () => {
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();
  const attendeeRepository = createMock<EventAttendeeRepository>();

  let useCase: GetSecretSantaDrawUseCase;
  let creator: User;
  let participant: User;
  let attendee: EventAttendee;
  let santaUser: SecretSantaUser;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    const event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    attendee = event.attendees[1]!;
    santaUser = new SecretSantaUserBuilder().withAttendeeId(attendee.id).build();

    secretSantaUserRepository.findDrawSecretSantaUserForEvent.mockResolvedValue(santaUser);
    attendeeRepository.findById.mockResolvedValue(attendee);

    useCase = new GetSecretSantaDrawUseCase(secretSantaUserRepository, attendeeRepository);
  });

  it('should return undefined when there is no draw for the current user', async () => {
    secretSantaUserRepository.findDrawSecretSantaUserForEvent.mockResolvedValueOnce(undefined);

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: attendee.eventId });

    expect(result.attendee).toBeUndefined();
    expect(attendeeRepository.findById).not.toHaveBeenCalled();
  });

  it('should return undefined when the drawn attendee cannot be found', async () => {
    attendeeRepository.findById.mockResolvedValueOnce(undefined);

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: attendee.eventId });

    expect(result.attendee).toBeUndefined();
    expect(attendeeRepository.findById).toHaveBeenCalledWith(santaUser.attendeeId);
  });

  it('should return the drawn attendee', async () => {
    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: attendee.eventId });

    expect(result.attendee).toBe(attendee);
    expect(secretSantaUserRepository.findDrawSecretSantaUserForEvent).toHaveBeenCalledWith({
      eventId: attendee.eventId,
      userId: creator.id,
    });
  });
});
