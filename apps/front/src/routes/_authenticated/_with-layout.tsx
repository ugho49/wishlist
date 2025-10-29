import { createFileRoute } from '@tanstack/react-router'

import { AuthenticatedContainerOutlet } from '../../components/common/router/outlet/AuthenticatedContainerOutlet'

export const Route = createFileRoute('/_authenticated/_with-layout')({
  component: () => <AuthenticatedContainerOutlet />,
})
