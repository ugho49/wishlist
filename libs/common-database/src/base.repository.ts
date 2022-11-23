import { Type } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

type BaseRepositoryConstructor<T> = new (...args: unknown[]) => T;

export function BaseRepository<T extends ObjectLiteral>(entity: BaseRepositoryConstructor<T>): Type<Repository<T>> {
  class BaseRepositoryClass extends Repository<T> {
    constructor(@InjectRepository(entity) private readonly repository: Repository<T>) {
      super(repository.target, repository.manager, repository.queryRunner);
    }
  }

  return BaseRepositoryClass;
}
