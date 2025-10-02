import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Container, Tab, Tabs } from '@mui/material'
import { useQueryState } from 'nuqs'

import { useWishlistById } from '../../hooks/domain/useWishlistById'
import { Route } from '../../routes/_authenticated/wishlists.$wishlistId.edit'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EditWishlistEvent } from './EditWishlistEvents'
import { EditWishlistInformations } from './EditWishlistInformations'
import { WishlistNotFound } from './WishlistNotFound'

enum TabValues {
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

export const EditWishlistPage = () => {
  const { wishlistId } = Route.useParams()
  const [tab, setTab] = useQueryState('tab', { defaultValue: TabValues.informations })
  const { wishlist, loading, currentUserCanEdit } = useWishlistById(wishlistId)

  return (
    <Box>
      <Title smallMarginBottom>Modifier la liste</Title>
      <Loader loading={loading}>
        {(!wishlist || !currentUserCanEdit) && <WishlistNotFound />}
        {wishlist && currentUserCanEdit && (
          <Container maxWidth="md">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
              <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
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
