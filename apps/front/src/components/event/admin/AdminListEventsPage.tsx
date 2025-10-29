import { Box } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Title } from '@wishlist/front-components/common/Title'

import { AdminListEvents } from './AdminListEvents'

export const AdminListEventsPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/admin/events/' })
  const navigate = useNavigate({ from: '/admin/events' })

  const changeCurrentPage = (page: number) => {
    void navigate({ search: prev => ({ ...prev, page }) })
  }

  return (
    <Box>
      <Title>Liste des évènements</Title>

      <AdminListEvents currentPage={currentPage} changeCurrentPage={changeCurrentPage} />
    </Box>
  )
}
