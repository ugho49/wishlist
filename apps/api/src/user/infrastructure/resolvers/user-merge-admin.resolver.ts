import type { ICurrentUser, UserId } from '@wishlist/common';

import { Args, Mutation, Query, Resolver } from '@znight/graphql';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type AdminMergeUsersResult, type AdminUserMergePreviewResult } from '../../../gql/generated-types';
import { MergeUsersUseCase } from '../../application/command/merge-users.use-case';
import { GetUserMergePreviewUseCase } from '../../application/query/get-user-merge-preview.use-case';
import { UserIdSchema } from '../user.schema';
import { AdminMergeUsersInputSchema, type AdminMergeUsersParsedInput } from '../user-admin.schema';
import { userMergeMapper } from '../user-merge.mapper';

@IsAdmin()
@Resolver()
export class UserMergeAdminResolver {
  constructor(
    private readonly getUserMergePreviewUseCase: GetUserMergePreviewUseCase,
    private readonly mergeUsersUseCase: MergeUsersUseCase,
  ) {}

  @Query()
  async adminUserMergePreview(
    @Args('sourceUserId', UserIdSchema) sourceUserId: UserId,
    @Args('targetUserId', UserIdSchema) targetUserId: UserId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminUserMergePreviewResult> {
    const preview = await this.getUserMergePreviewUseCase.execute({ currentUser, sourceUserId, targetUserId });
    return userMergeMapper.toGqlAdminUserMergePreview(preview);
  }

  @Mutation()
  async adminMergeUsers(
    @Args('input', AdminMergeUsersInputSchema) input: AdminMergeUsersParsedInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminMergeUsersResult> {
    await this.mergeUsersUseCase.execute({ currentUser, ...input });
    return { __typename: 'VoidOutput', success: true };
  }
}
