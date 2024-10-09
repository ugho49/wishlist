import { Injectable } from '@nestjs/common'
import { BaseRepository } from '@wishlist/common-database'
import { ArrayContains, In } from 'typeorm'

import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity'

@Injectable()
export class SecretSantaRepository extends BaseRepository(SecretSantaEntity) {
  getSecretSantaForEventAndUser(param: { eventId: string; userId: string }): Promise<SecretSantaEntity | null> {
    const { eventId, userId } = param
    return this.createQueryBuilder('ss')
      .leftJoinAndSelect('ss.users', 'u')
      .innerJoinAndSelect('ss.event', 'e')
      .leftJoin('e.attendees', 'a')
      .where('e.id = :eventId', { eventId })
      .andWhere('a.userId = :userId', { userId })
      .getOne()
  }

  getSecretSantaForUserOrFail(param: { id: string; userId: string }): Promise<SecretSantaEntity> {
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
    eventId: string
    userId: string
  }): Promise<SecretSantaUserEntity | null> {
    const { eventId, userId } = param
    const currentSantaUser = await this.createQueryBuilder('ssu')
      .select('ssu.id')
      .innerJoin('ssu.attendee', 'a')
      .innerJoin('ssu.secretSanta', 'ss')
      .leftJoin('a.user', 'u')
      .where('ss.eventId = :eventId', { eventId })
      .andWhere('u.id = :userId', { userId })
      .getOne()

    if (!currentSantaUser) {
      return null
    }

    return await this.findOneBy({ id: currentSantaUser.id })
  }

  attendeesExistsForSecretSanta(param: { secretSantaId: string; attendeeIds: string[] }): Promise<boolean> {
    return this.exists({
      where: { secretSantaId: param.secretSantaId, attendeeId: In(param.attendeeIds) },
    })
  }
}
