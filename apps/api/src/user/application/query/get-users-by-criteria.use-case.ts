import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type ICurrentUser, MiniUserDto } from '@wishlist/common';
import { isEmpty } from 'lodash';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { userMapper } from '../../infrastructure/user.mapper';

export type GetUsersByCriteriaInput = {
  currentUser: ICurrentUser;
  criteria: string;
};

@Injectable()
export class GetUsersByCriteriaUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetUsersByCriteriaInput): Promise<MiniUserDto[]> {
    const { criteria } = query;

    if (isEmpty(criteria) || criteria.trim().length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const users = await this.userRepository.findAllByCriteria({
      criteria,
      ignoreUserId: query.currentUser.id,
      limit: 10,
    });

    return users.map(user => userMapper.toMiniUserDto(user));
  }
}
