import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@wishlist/common-database';
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity';

@Injectable()
export class SecretSantaRepository extends BaseRepository(SecretSantaEntity) {
  getSecretSantaForEventAndUser(param: { eventId: string; userId: string }): Promise<SecretSantaEntity | null> {
    const { eventId, userId } = param;
    return this.createQueryBuilder('ss')
      .leftJoinAndSelect('ss.users', 'u')
      .innerJoinAndSelect('ss.event', 'e')
      .where('e.id = :eventId', { eventId })
      .andWhere('e.creatorId = :userId', { userId })
      .getOne();
  }

  getSecretSantaForUserOrFail(param: { id: string; userId: string }): Promise<SecretSantaEntity> {
    const { id, userId } = param;
    return this.createQueryBuilder('ss')
      .leftJoinAndSelect('ss.users', 'u')
      .innerJoin('ss.event', 'e')
      .where('ss.id = :id', { id })
      .andWhere('e.creatorId = :userId', { userId })
      .getOneOrFail();
  }
}

@Injectable()
export class SecretSantaUserRepository extends BaseRepository(SecretSantaUserEntity) {
  async getDrawSecretSantaUserForEvent(param: {
    eventId: string;
    userId: string;
  }): Promise<SecretSantaUserEntity | null> {
    const { eventId, userId } = param;
    const currentSantaUser = await this.createQueryBuilder('ssu')
      .select('ssu.id')
      .innerJoin('ssu.attendee', 'a')
      .innerJoin('ssu.secretSanta', 'ss')
      .leftJoin('a.user', 'u')
      .where('ss.eventId = :eventId', { eventId })
      .andWhere('u.id = :userId', { userId })
      .getOne();

    if (!currentSantaUser) {
      return null;
    }

    return await this.findOneBy({ id: currentSantaUser.id });
  }
}
