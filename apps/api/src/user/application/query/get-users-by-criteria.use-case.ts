import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';
import { isEmpty } from 'lodash';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetUsersByCriteriaInput = {
  currentUser: ICurrentUser;
  criteria: string;
};

export type GetUsersByCriteriaOutput = {
  users: User[];
};

@Injectable()
export class GetUsersByCriteriaUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersByCriteriaInput): Promise<GetUsersByCriteriaOutput> {
    const { criteria } = query;

    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const users = await this.userRepository.findAllByCriteria({
      criteria,
      ignoreUserId: query.currentUser.id,
      limit: 10,
    });

    return { users };
  }
}
