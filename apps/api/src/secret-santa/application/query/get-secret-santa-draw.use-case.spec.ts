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
  let drawnAttendee: EventAttendee;
  let participantSantaUser: SecretSantaUser;
  let drawnSantaUser: SecretSantaUser;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    const event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    drawnAttendee = event.attendees[1]!;
    drawnSantaUser = new SecretSantaUserBuilder().withAttendeeId(drawnAttendee.id).build();
    participantSantaUser = new SecretSantaUserBuilder()
      .withAttendeeId(event.attendees[0]!.id)
      .withDraw(drawnSantaUser.id)
      .build();

    secretSantaUserRepository.findParticipantForEvent.mockResolvedValue(participantSantaUser);
    secretSantaUserRepository.findById.mockResolvedValue(drawnSantaUser);
    attendeeRepository.findById.mockResolvedValue(drawnAttendee);

    useCase = new GetSecretSantaDrawUseCase(secretSantaUserRepository, attendeeRepository);
  });

  it('should return no draw when the current user is not in the secret santa', async () => {
    secretSantaUserRepository.findParticipantForEvent.mockResolvedValueOnce(undefined);

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: drawnAttendee.eventId });

    expect(result).toEqual({ attendee: undefined, revealed: false });
    expect(secretSantaUserRepository.findById).not.toHaveBeenCalled();
    expect(attendeeRepository.findById).not.toHaveBeenCalled();
  });

  it('should return no draw when the secret santa has not been started', async () => {
    secretSantaUserRepository.findParticipantForEvent.mockResolvedValueOnce(
      new SecretSantaUserBuilder().withAttendeeId(drawnAttendee.id).build(),
    );

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: drawnAttendee.eventId });

    expect(result).toEqual({ attendee: undefined, revealed: false });
    expect(secretSantaUserRepository.findById).not.toHaveBeenCalled();
    expect(attendeeRepository.findById).not.toHaveBeenCalled();
  });

  it('should return no draw when the drawn participant cannot be found', async () => {
    secretSantaUserRepository.findById.mockResolvedValueOnce(undefined);

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: drawnAttendee.eventId });

    expect(result).toEqual({ attendee: undefined, revealed: false });
    expect(attendeeRepository.findById).not.toHaveBeenCalled();
  });

  it('should return no draw when the drawn attendee cannot be found', async () => {
    attendeeRepository.findById.mockResolvedValueOnce(undefined);

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: drawnAttendee.eventId });

    expect(result).toEqual({ attendee: undefined, revealed: false });
    expect(attendeeRepository.findById).toHaveBeenCalledWith(drawnSantaUser.attendeeId);
  });

  it('should return the drawn attendee as not yet revealed', async () => {
    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: drawnAttendee.eventId });

    expect(result).toEqual({ attendee: drawnAttendee, revealed: false });
    expect(secretSantaUserRepository.findParticipantForEvent).toHaveBeenCalledWith({
      eventId: drawnAttendee.eventId,
      userId: creator.id,
    });
    expect(secretSantaUserRepository.findById).toHaveBeenCalledWith(drawnSantaUser.id);
  });

  it('should return the drawn attendee as already revealed', async () => {
    secretSantaUserRepository.findParticipantForEvent.mockResolvedValueOnce(participantSantaUser.revealDraw());

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: drawnAttendee.eventId });

    expect(result.attendee).toBe(drawnAttendee);
    expect(result.revealed).toBe(true);
  });
});
