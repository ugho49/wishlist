import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserMergeFootprint, UserMergeRepository } from '../../domain/repository/user-merge.repository';

import { UnauthorizedException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { User } from '../../domain/model/user.model';
import { GetUserMergePreviewUseCase } from './get-user-merge-preview.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUserMergePreviewUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userMergeRepository = createMock<UserMergeRepository>();

  let useCase: GetUserMergePreviewUseCase;
  let admin: User;
  let source: User;
  let target: User;
  const sourceFootprint: UserMergeFootprint = { attendances: [], wishlists: [], reservedItemCount: 2 };
  const targetFootprint: UserMergeFootprint = { attendances: [], wishlists: [], reservedItemCount: 0 };

  beforeEach(() => {
    mock.clearAllMocks();

    admin = new UserBuilder().asAdmin().build();
    source = new UserBuilder().withEmail('jean@gmail.com').build();
    target = new UserBuilder().withEmail('jean@work.fr').build();

    userRepository.findByIdOrFail.mockImplementation(id => Promise.resolve(id === source.id ? source : target));
    userMergeRepository.findFootprint.mockImplementation(userId =>
      Promise.resolve(userId === source.id ? sourceFootprint : targetFootprint),
    );

    useCase = new GetUserMergePreviewUseCase(userRepository, userMergeRepository);
  });

  it('should reject previewing a user merged into itself', async () => {
    await expect(
      useCase.execute({ currentUser: toCurrentUser(admin), sourceUserId: source.id, targetUserId: source.id }),
    ).rejects.toThrow(BusinessRuleException);
    expect(userMergeRepository.findFootprint).not.toHaveBeenCalled();
  });

  it('should reject when the current admin is one of the users', async () => {
    await expect(
      useCase.execute({ currentUser: toCurrentUser(admin), sourceUserId: source.id, targetUserId: admin.id }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userMergeRepository.findFootprint).not.toHaveBeenCalled();
  });

  it('should reject a user the current admin cannot manage', async () => {
    target = new UserBuilder().asAdmin().build();

    await expect(
      useCase.execute({ currentUser: toCurrentUser(admin), sourceUserId: source.id, targetUserId: target.id }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userMergeRepository.findFootprint).not.toHaveBeenCalled();
  });

  it('should return both users with their footprint', async () => {
    const preview = await useCase.execute({
      currentUser: toCurrentUser(admin),
      sourceUserId: source.id,
      targetUserId: target.id,
    });

    expect(preview).toEqual({
      source: { user: source, footprint: sourceFootprint },
      target: { user: target, footprint: targetFootprint },
    });
  });
});
