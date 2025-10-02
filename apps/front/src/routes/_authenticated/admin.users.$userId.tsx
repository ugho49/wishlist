import { createFileRoute } from '@tanstack/react-router'

import { AdminUserPage } from '../../components/user/admin/AdminUserPage'

export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: AdminUserPage,
})
