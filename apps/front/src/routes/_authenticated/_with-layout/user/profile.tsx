import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { TabValues, UserProfilePage } from '../../../../components/user/UserProfilePage'

export const Route = createFileRoute('/_authenticated/_with-layout/user/profile')({
  component: () => <UserProfilePage />,
  validateSearch: z.object({
    tab: z.enum(TabValues).optional().catch(TabValues.informations).default(TabValues.informations),
  }),
})
