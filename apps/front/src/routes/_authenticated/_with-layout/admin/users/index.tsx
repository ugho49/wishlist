import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { AdminListUsers } from '../../../../../components/user/admin/AdminListUsers'

export const Route = createFileRoute('/_authenticated/_with-layout/admin/users/')({
  component: () => <AdminListUsers />,
  validateSearch: z.object({
    page: z.number().optional().default(1),
    search: z.string().optional().default(''),
  }),
})
