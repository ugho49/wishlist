import type { WishlistId } from '@wishlist/common'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Container, Tab, Tabs } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { useWishlistById } from '../../hooks/domain/useWishlistById'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EditWishlistEvent } from './EditWishlistEvents'
import { EditWishlistInformations } from './EditWishlistInformations'
import { WishlistNotFound } from './WishlistNotFound'

export enum TabValues {
  informations = 'informations',
  events = 'events',
}

const tabs = [
  {
    value: TabValues.informations,
    label: 'Informations',
    icon: <InfoOutlinedIcon />,
  },
  {
    value: TabValues.events,
    label: 'Evènements',
    icon: <CalendarMonthIcon />,
  },
]

interface EditWishlistPageProps {
  wishlistId: WishlistId
}

export const EditWishlistPage = ({ wishlistId }: EditWishlistPageProps) => {
  const { tab } = useSearch({ from: '/_authenticated/_with-layout/wishlists/$wishlistId/edit' })
  const { wishlist, loading, currentUserCanEdit } = useWishlistById(wishlistId)
  const navigate = useNavigate({ from: '/wishlists/$wishlistId/edit' })

  return (
    <Box>
      <Title>Modifier la liste</Title>
      <Loader loading={loading}>
        {(!wishlist || !currentUserCanEdit) && <WishlistNotFound />}
        {wishlist && currentUserCanEdit && (
          <Container maxWidth="md">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
              <Tabs
                value={tab}
                onChange={(_, newValue) => navigate({ search: { tab: newValue as TabValues } })}
                variant="fullWidth"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                {tabs.map(tab => (
                  <Tab key={tab.value} value={tab.value} label={tab.label} iconPosition="start" icon={tab.icon} />
                ))}
              </Tabs>
            </Box>
            {tab === TabValues.informations && <EditWishlistInformations wishlist={wishlist} />}
            {tab === TabValues.events && <EditWishlistEvent wishlistId={wishlist.id} events={wishlist.events} />}
          </Container>
        )}
      </Loader>
    </Box>
  )
}
