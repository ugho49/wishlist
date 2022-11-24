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
    pageSize: number;
    offset: number;
    criteria?: string;
  }): Promise<[UserEntity[], number]> {
    const { criteria, offset, pageSize } = params;

    const query = this.createQueryBuilder('u').addOrderBy('u.createdAt', 'DESC').limit(pageSize).offset(offset);

    if (criteria) {
      query.where(this.findByNameOrEmail(criteria));
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
