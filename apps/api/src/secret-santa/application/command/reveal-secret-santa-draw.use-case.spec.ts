import type { EventId } from '@wishlist/common';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { Logger, NotFoundException } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { SecretSantaUser } from '../../domain/model/secret-santa-user.model';
import { RevealSecretSantaDrawUseCase } from './reveal-secret-santa-draw.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RevealSecretSantaDrawUseCase', () => {
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();

  let useCase: RevealSecretSantaDrawUseCase;
  let creator: User;
  let eventId: EventId;
  let participant: SecretSantaUser;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    const drawnUser = new UserBuilder().withEmail('drawn@test.fr').build();
    const event = new EventBuilder().withCreator(creator).withAttendee(drawnUser).build();
    eventId = event.id;
    const drawnSantaUser = new SecretSantaUserBuilder().withAttendeeId(event.attendees[1]!.id).build();
    participant = new SecretSantaUserBuilder()
      .withAttendeeId(event.attendees[0]!.id)
      .withDraw(drawnSantaUser.id)
      .build();

    secretSantaUserRepository.findParticipantForEvent.mockResolvedValue(participant);

    useCase = new RevealSecretSantaDrawUseCase(secretSantaUserRepository);
  });

  it('should reject when the current user has no secret santa draw', async () => {
    secretSantaUserRepository.findParticipantForEvent.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ currentUser: toCurrentUser(creator), eventId })).rejects.toThrow(NotFoundException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should reject when the draw has not been assigned yet', async () => {
    secretSantaUserRepository.findParticipantForEvent.mockResolvedValueOnce(
      new SecretSantaUserBuilder().withAttendeeId(participant.attendeeId).build(),
    );

    await expect(useCase.execute({ currentUser: toCurrentUser(creator), eventId })).rejects.toThrow(NotFoundException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should persist the reveal of the current user draw', async () => {
    await useCase.execute({ currentUser: toCurrentUser(creator), eventId });

    expect(secretSantaUserRepository.findParticipantForEvent).toHaveBeenCalledWith({
      eventId,
      userId: creator.id,
    });
    expect(secretSantaUserRepository.saveAll).toHaveBeenCalledTimes(1);
    const [saved] = secretSantaUserRepository.saveAll.mock.calls[0]![0];
    expect(saved?.id).toBe(participant.id);
    expect(saved?.hasRevealedDraw()).toBe(true);
    expect(saved?.drawUserId).toBe(participant.drawUserId);
  });

  it('should keep an already revealed draw unchanged', async () => {
    secretSantaUserRepository.findParticipantForEvent.mockResolvedValueOnce(participant.revealDraw());

    await useCase.execute({ currentUser: toCurrentUser(creator), eventId });

    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });
});
