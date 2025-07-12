import { Type } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, ObjectLiteral, Repository } from 'typeorm'

type BaseRepositoryConstructor<T> = new (...args: unknown[]) => T

/**
 * @deprecated: will be replaced by drizzle
 */
export type IBaseRepository<T extends ObjectLiteral> = Repository<T> & {
  getDataSource: () => DataSource
  transaction: <I>(runInTransaction: (entityManager: EntityManager) => Promise<I>) => Promise<I>
}

/**
 * @deprecated: will be replaced by drizzle
 */
export function BaseRepository<T extends ObjectLiteral>(
  entity: BaseRepositoryConstructor<T>,
): Type<IBaseRepository<T>> {
  class BaseRepositoryClass extends Repository<T> implements IBaseRepository<T> {
    constructor(
      @InjectRepository(entity) private readonly repository: Repository<T>,
      private readonly dataSource: DataSource,
    ) {
      super(repository.target, repository.manager, repository.queryRunner)
    }

    getDataSource() {
      return this.dataSource
    }

    transaction<I>(runInTransaction: (entityManager: EntityManager) => Promise<I>): Promise<I> {
      return this.dataSource.transaction(runInTransaction)
    }
  }

  return BaseRepositoryClass
}
