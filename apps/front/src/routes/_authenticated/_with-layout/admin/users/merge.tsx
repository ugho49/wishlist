import type { UserId } from '@wishlist/common';

import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { AdminMergeUsersPage } from '../../../../../components/user/admin/merge/AdminMergeUsersPage';

export const Route = createFileRoute('/_authenticated/_with-layout/admin/users/merge')({
  validateSearch: z.object({
    sourceId: z.string().optional().catch(undefined),
    targetId: z.string().optional().catch(undefined),
  }),
  component: () => {
    const { sourceId, targetId } = Route.useSearch();
    return (
      <AdminMergeUsersPage
        sourceUserId={sourceId as UserId | undefined}
        targetUserId={targetId as UserId | undefined}
      />
    );
  },
});
