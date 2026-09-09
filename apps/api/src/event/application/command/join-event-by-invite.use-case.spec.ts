import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { Logger, NotFoundException } from '@nestjs/common';
import { type AttendeeId, uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { Event } from '../../domain/model/event.model';
import { JoinEventByInviteUseCase } from './join-event-by-invite.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('JoinEventByInviteUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const attendeeRepository = createMock<EventAttendeeRepository>();
  const userRepository = createMock<UserRepository>();

  let useCase: JoinEventByInviteUseCase;
  let creator: User;
  let event: Event;
  let attendeeId: AttendeeId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    event = new EventBuilder().withCreator(creator).build();
    attendeeId = uuid() as AttendeeId;

    eventRepository.findByInviteToken.mockResolvedValue(event);
    eventRepository.findByIdOrFail.mockResolvedValue(event);
    attendeeRepository.newId.mockReturnValue(attendeeId);
    userRepository.findByIdOrFail.mockResolvedValue(creator);

    useCase = new JoinEventByInviteUseCase(eventRepository, attendeeRepository, userRepository);
  });

  it('should reject when the token is unknown', async () => {
    const joiner = new UserBuilder().withEmail('joiner@test.fr').build();
    eventRepository.findByInviteToken.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ currentUser: toCurrentUser(joiner), token: 'unknown' })).rejects.toThrow(
      NotFoundException,
    );
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should return the event without saving when the user is already an attendee', async () => {
    const { event: joined } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      token: event.inviteToken,
    });

    expect(joined.id).toBe(event.id);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should add the current user as a participant', async () => {
    const joiner = new UserBuilder().withEmail('joiner@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValueOnce(joiner);

    await useCase.execute({ currentUser: toCurrentUser(joiner), token: event.inviteToken });

    expect(attendeeRepository.save).toHaveBeenCalledTimes(1);
    const saved = attendeeRepository.save.mock.calls[0]?.[0];
    expect(saved?.user?.id).toBe(joiner.id);
    expect(saved?.role).toBe(AttendeeRole.PARTICIPANT);
    expect(eventRepository.findByIdOrFail).toHaveBeenCalledWith(event.id);
  });

  it('should convert a pending invite matching the current user email', async () => {
    const pendingEmail = 'pending@test.fr';
    const eventWithPending = new EventBuilder().withCreator(creator).withPendingAttendee(pendingEmail).build();
    const joiner = new UserBuilder().withEmail(pendingEmail).build();

    eventRepository.findByInviteToken.mockResolvedValueOnce(eventWithPending);
    eventRepository.findByIdOrFail.mockResolvedValueOnce(eventWithPending);
    userRepository.findByIdOrFail.mockResolvedValueOnce(joiner);

    await useCase.execute({ currentUser: toCurrentUser(joiner), token: eventWithPending.inviteToken });

    expect(attendeeRepository.save).toHaveBeenCalledTimes(1);
    const saved = attendeeRepository.save.mock.calls[0]?.[0];
    expect(saved?.user?.id).toBe(joiner.id);
    expect(saved?.pendingEmail).toBeUndefined();
    expect(attendeeRepository.newId).not.toHaveBeenCalled();
  });
});
