import type { UserId } from '@wishlist/common';

import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { AdminUserPage, AdminUserTab } from '../../../../../components/user/admin/AdminUserPage';

export const Route = createFileRoute('/_authenticated/_with-layout/admin/users/$userId')({
  params: {
    parse: params => ({ userId: params.userId as UserId }),
  },
  validateSearch: z.object({
    eventPage: z.number().optional().default(1),
    tab: z.enum(AdminUserTab).optional().catch(AdminUserTab.profile).default(AdminUserTab.profile),
  }),
  component: () => {
    const { userId } = Route.useParams();
    return <AdminUserPage userId={userId} />;
  },
});
