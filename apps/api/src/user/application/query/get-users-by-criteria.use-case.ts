import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { BadRequestException } from '@znight/http';
import { isEmpty } from 'lodash';

export type GetUsersByCriteriaInput = {
  currentUser: ICurrentUser;
  criteria: string;
};

export type GetUsersByCriteriaOutput = {
  users: User[];
};

@Injectable()
export class GetUsersByCriteriaUseCase {
  constructor(private readonly userRepository: UserRepository) {}

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
