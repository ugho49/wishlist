import { BadRequestException, ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EventRepository } from '../event/event.repository';
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository';
import {
  AttendeeDto,
  CreateSecretSantaInputDto,
  CreateSecretSantaUserInputDto,
  SecretSantaDto,
  SecretSantaStatus,
  SecretSantaUserDto,
  UpdateSecretSantaInputDto,
  UpdateSecretSantaUserInputDto,
} from '@wishlist/common-types';
import { toSecretSantaDto, toSecretSantaUserDto } from './secret-santa.mapper';
import { toAttendeeDto } from '../attendee/attendee.mapper';
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity';
import { In } from 'typeorm';
import { SecretSantaDrawService } from './secret-santa-draw.service';

@Injectable()
export class SecretSantaService {
  private readonly drawService = new SecretSantaDrawService();

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly secretSantaRepository: SecretSantaRepository,
    private readonly secretSantaUserRepository: SecretSantaUserRepository,
  ) {}

  async getSecretSantaForEvent(param: { eventId: string; currentUserId: string }): Promise<SecretSantaDto | null> {
    return this.secretSantaRepository
      .getSecretSantaForEventAndUser({
        eventId: param.eventId,
        userId: param.currentUserId,
      })
      .then((entity) => (entity ? toSecretSantaDto(entity) : null));
  }

  async getMySecretSantaUserForEvent(param: { eventId: string; currentUserId: string }): Promise<AttendeeDto | null> {
    return this.secretSantaUserRepository
      .getDrawSecretSantaUserForEvent({
        eventId: param.eventId,
        userId: param.currentUserId,
      })
      .then((entity) => (entity ? entity.attendee : null))
      .then((entity) => (entity ? toAttendeeDto(entity) : null));
  }

  async createSecretSantaForEvent(param: {
    currentUserId: string;
    dto: CreateSecretSantaInputDto;
  }): Promise<SecretSantaDto> {
    const alreadyExists = await this.secretSantaRepository.exist({ where: { eventId: param.dto.event_id } });

    if (alreadyExists) {
      throw new BadRequestException('Secret santa already exists for event');
    }

    const event = await this.eventRepository.findOneOrFail({
      where: { id: param.dto.event_id, creatorId: param.currentUserId },
    });

    const entity = SecretSantaEntity.create({
      eventId: event.id,
      budget: param.dto.budget,
      description: param.dto.description,
    });

    await this.secretSantaRepository.save(entity);

    return toSecretSantaDto(entity);
  }

  async updateSecretSanta(param: {
    currentUserId: string;
    secretSantaId: string;
    dto: UpdateSecretSantaInputDto;
  }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    });

    await this.checkSecretSantaNotStarted(secretSanta);

    await this.secretSantaRepository.update(
      { id: secretSanta.id },
      {
        description: param.dto.description ?? null,
        budget: param.dto.budget ?? null,
      },
    );
  }

  async deleteSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    });

    await this.checkSecretSantaNotStarted(secretSanta);

    await this.secretSantaRepository.delete({ id: secretSanta.id });
  }

  async startSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    });

    await this.checkSecretSantaNotStarted(secretSanta);

    const secretSantaUsers = await this.secretSantaUserRepository.findBy({ secretSantaId: secretSanta.id });

    if (secretSantaUsers.length < 2) {
      throw new UnprocessableEntityException('Not enough attendees for secret santa');
    }

    try {
      const assignedUsers = this.drawService.assignSecretSantas(secretSantaUsers);

      await this.secretSantaRepository.transaction(async (em) => {
        for (const user of assignedUsers) {
          await em.update(SecretSantaUserEntity, { id: user.id }, { drawUserId: user.drawUserId });
        }

        await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.STARTED });
      });
    } catch (e) {
      throw new UnprocessableEntityException('Failed to draw secret santa, please try again');
    }
  }

  async cancelSecretSanta(param: { currentUserId: string; secretSantaId: string }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    });

    if (secretSanta.status === SecretSantaStatus.CREATED) {
      throw new BadRequestException('Secret santa not yet started');
    }

    await this.secretSantaRepository.transaction(async (em) => {
      await em.update(SecretSantaEntity, { id: secretSanta.id }, { status: SecretSantaStatus.CREATED });
      await em.update(SecretSantaUserEntity, { secretSantaId: secretSanta.id }, { drawUserId: null });
    });
  }

  async addSecretSantaUser(param: {
    currentUserId: string;
    secretSantaId: string;
    dto: CreateSecretSantaUserInputDto;
  }): Promise<SecretSantaUserDto> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    });

    await this.checkSecretSantaNotStarted(secretSanta);

    const alreadyExists = await this.secretSantaUserRepository.exist({
      where: { secretSantaId: secretSanta.id, attendeeId: param.dto.attendee_id },
    });

    if (alreadyExists) {
      throw new BadRequestException('Secret santa already exists for event');
    }

    const eventAttendees = await secretSanta.event.then((event) => event.attendees);

    if (!eventAttendees.some((a) => a.id === param.dto.attendee_id)) {
      throw new BadRequestException('Attendee not found for event');
    }

    const entity = SecretSantaUserEntity.create({
      secretSantaId: secretSanta.id,
      attendeeId: param.dto.attendee_id,
    });

    await this.secretSantaUserRepository.save(entity);

    return toSecretSantaUserDto(entity);
  }

  async updateSecretSantaUser(param: {
    currentUserId: string;
    secretSantaId: string;
    secretSantaUserId: string;
    dto: UpdateSecretSantaUserInputDto;
  }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    });

    await this.checkSecretSantaNotStarted(secretSanta);

    const secretSantaUsers =
      param.dto.exclusions.length === 0
        ? []
        : await this.secretSantaUserRepository.findBy({
            id: In(param.dto.exclusions),
            secretSantaId: param.secretSantaId,
          });

    const exclusionsIds = secretSantaUsers.map((u) => u.id);

    if (exclusionsIds.includes(param.secretSantaUserId)) {
      throw new BadRequestException('Secret santa user cannot exclude himself');
    }

    await this.secretSantaUserRepository.update(
      { id: param.secretSantaUserId },
      {
        exclusions: exclusionsIds,
      },
    );
  }

  async deleteSecretSantaUser(param: {
    currentUserId: string;
    secretSantaId: string;
    secretSantaUserId: string;
  }): Promise<void> {
    const secretSanta = await this.secretSantaRepository.getSecretSantaForUserOrFail({
      id: param.secretSantaId,
      userId: param.currentUserId,
    });

    await this.checkSecretSantaNotStarted(secretSanta);

    await this.secretSantaUserRepository.delete({ id: param.secretSantaUserId });
  }

  private async checkSecretSantaNotStarted(secretSanta: SecretSantaEntity) {
    if (secretSanta.status === SecretSantaStatus.STARTED) {
      throw new ForbiddenException('Secret santa already started');
    }
  }
}
