import { createFileRoute } from '@tanstack/react-router'

import { AdminPage } from '../../../../components/admin/AdminPage'

export const Route = createFileRoute('/_authenticated/_with-layout/admin/')({
  component: () => <AdminPage />,
})
