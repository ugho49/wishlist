import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserMergeFootprint, UserMergeRepository } from '../../domain/repository/user-merge.repository';

import { type ICurrentUser, type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { findMergeableUsers } from '../user-merge.access';

export type GetUserMergePreviewInput = {
  currentUser: ICurrentUser;
  sourceUserId: UserId;
  targetUserId: UserId;
};

export type UserMergeCandidate = {
  user: User;
  footprint: UserMergeFootprint;
};

export type GetUserMergePreviewOutput = {
  source: UserMergeCandidate;
  target: UserMergeCandidate;
};

@Injectable()
export class GetUserMergePreviewUseCase {
  private readonly logger = getLogger(GetUserMergePreviewUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMergeRepository: UserMergeRepository,
  ) {}

  async execute(input: GetUserMergePreviewInput): Promise<GetUserMergePreviewOutput> {
    const { currentUser, sourceUserId, targetUserId } = input;
    this.logger.info('User merge preview request received', { sourceUserId, targetUserId });

    const { source, target } = await findMergeableUsers({
      userRepository: this.userRepository,
      currentUser,
      sourceUserId,
      targetUserId,
    });

    const [sourceFootprint, targetFootprint] = await Promise.all([
      this.userMergeRepository.findFootprint(source.id),
      this.userMergeRepository.findFootprint(target.id),
    ]);

    return {
      source: { user: source, footprint: sourceFootprint },
      target: { user: target, footprint: targetFootprint },
    };
  }
}
