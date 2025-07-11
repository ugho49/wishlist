import { Injectable } from '@nestjs/common'
import { AttendeeId, EventId, SecretSantaId, UserId } from '@wishlist/common-types'
import { In } from 'typeorm'

import { BaseRepository } from '../../../common'
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity'

@Injectable()
export class SecretSantaRepository extends BaseRepository(SecretSantaEntity) {
  getSecretSantaForEventAndUser(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaEntity | null> {
    const { eventId, userId } = param
    return this.createQueryBuilder('ss')
      .leftJoinAndSelect('ss.users', 'u')
      .innerJoinAndSelect('ss.event', 'e')
      .leftJoin('e.attendees', 'a')
      .where('e.id = :eventId', { eventId })
      .andWhere('a.userId = :userId', { userId })
      .getOne()
  }

  getSecretSantaForUserOrFail(param: { id: SecretSantaId; userId: UserId }): Promise<SecretSantaEntity> {
    const { id, userId } = param
    return this.createQueryBuilder('ss')
      .leftJoinAndSelect('ss.users', 'u')
      .innerJoin('ss.event', 'e')
      .leftJoin('e.attendees', 'a')
      .where('ss.id = :id', { id })
      .andWhere('a.userId = :userId', { userId })
      .getOneOrFail()
  }
}

@Injectable()
export class SecretSantaUserRepository extends BaseRepository(SecretSantaUserEntity) {
  async getDrawSecretSantaUserForEvent(param: {
    eventId: EventId
    userId: UserId
  }): Promise<SecretSantaUserEntity | null> {
    const { eventId, userId } = param
    const currentSantaUser = await this.createQueryBuilder('ssu')
      .innerJoin('ssu.attendee', 'a')
      .innerJoin('ssu.secretSanta', 'ss')
      .leftJoin('a.user', 'u')
      .where('ss.eventId = :eventId', { eventId })
      .andWhere('u.id = :userId', { userId })
      .getOne()

    if (!currentSantaUser?.drawUserId) {
      return null
    }

    return await this.findOneBy({ id: currentSantaUser.drawUserId })
  }

  attendeesExistsForSecretSanta(param: { secretSantaId: SecretSantaId; attendeeIds: AttendeeId[] }): Promise<boolean> {
    return this.exists({
      where: { secretSantaId: param.secretSantaId, attendeeId: In(param.attendeeIds) },
    })
  }
}
