import type { User } from '../domain/model/user.model';
import type { UserRepository } from '../domain/repository/user.repository';

import { type ICurrentUser, type UserId } from '@wishlist/common';
import { UnauthorizedException } from '@znight/http';

import { BusinessRuleException } from '../../core/common/business-rule.exception';

/**
 * Loads the two users of a merge and checks the current admin may merge them: two distinct users, none of
 * them the current admin, both manageable by them.
 */
export async function findMergeableUsers(params: {
  userRepository: UserRepository;
  currentUser: ICurrentUser;
  sourceUserId: UserId;
  targetUserId: UserId;
}): Promise<{ source: User; target: User }> {
  const { userRepository, currentUser, sourceUserId, targetUserId } = params;

  if (sourceUserId === targetUserId) {
    throw new BusinessRuleException('INVALID_USER_MERGE', 'A user cannot be merged into itself');
  }

  if (currentUser.id === sourceUserId || currentUser.id === targetUserId) {
    throw new UnauthorizedException('You cannot merge yourself');
  }

  const [source, target] = await Promise.all([
    userRepository.findByIdOrFail(sourceUserId),
    userRepository.findByIdOrFail(targetUserId),
  ]);

  if (!source.canBeManagedBy(currentUser) || !target.canBeManagedBy(currentUser)) {
    throw new UnauthorizedException('You cannot merge these users');
  }

  return { source, target };
}
