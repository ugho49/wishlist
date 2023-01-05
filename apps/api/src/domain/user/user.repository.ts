import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@wishlist/common-database';
import { UserEntity } from './user.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Brackets, In, Not } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository(UserEntity) {
  findById(id: string): Promise<UserEntity | null> {
    return this.findOneBy({ id });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOneBy({ email });
  }

  findByEmails(emails: string[]): Promise<UserEntity[]> {
    return this.findBy({ email: In(emails) });
  }

  updateById(id: string, partialEntity: QueryDeepPartialEntity<UserEntity>) {
    return this.update({ id }, partialEntity);
  }

  searchByKeyword(param: { userId: string; keyword: string }): Promise<UserEntity[]> {
    const searchKey = param.keyword.trim().toLowerCase().normalize('NFC');

    return this.createQueryBuilder('u')
      .where({ id: Not(param.userId) })
      .andWhere(this.findByNameOrEmail(searchKey))
      .limit(10)
      .orderBy('u.firstName', 'ASC')
      .getMany();
  }

  findAllByCriteriaPaginated(params: {
    take: number;
    skip: number;
    criteria?: string;
  }): Promise<[UserEntity[], number]> {
    const { criteria, take, skip } = params;

    const query = this.createQueryBuilder('u').addOrderBy('u.createdAt', 'DESC').take(take).skip(skip);

    if (criteria) {
      const searchKey = criteria.trim().toLowerCase().normalize('NFC');
      query.where(this.findByNameOrEmail(searchKey));
    }

    return query.getManyAndCount();
  }

  private findByNameOrEmail(search: string) {
    const searchKey = `%${search}%`;

    return new Brackets((cb) =>
      cb
        .where('lower(u.firstName) like :search', { search: searchKey })
        .orWhere('lower(u.lastName) like :search', { search: searchKey })
        .orWhere('lower(u.email) like :search', { search: searchKey })
    );
  }
}
