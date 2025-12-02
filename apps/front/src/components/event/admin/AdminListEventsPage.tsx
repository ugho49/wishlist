import { Box } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Title } from '@wishlist/front-components/common/Title'

import { SEO } from '../../SEO'
import { AdminListEvents } from './AdminListEvents'

export const AdminListEventsPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/admin/events/' })
  const navigate = useNavigate({ from: '/admin/events' })

  const changeCurrentPage = (page: number) => {
    void navigate({ search: prev => ({ ...prev, page }) })
  }

  return (
    <>
      <SEO
        title="Admin - Événements"
        description="Administration - Liste des événements."
        canonical="/admin/events"
        noindex
      />
      <Box>
        <Title>Liste des évènements</Title>

        <AdminListEvents currentPage={currentPage} changeCurrentPage={changeCurrentPage} />
      </Box>
    </>
  )
}
