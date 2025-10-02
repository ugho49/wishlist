import { createFileRoute } from '@tanstack/react-router'

import { UserProfilePage } from '../../components/user/UserProfilePage'

export const Route = createFileRoute('/_authenticated/user/profile')({
  component: UserProfilePage,
})
