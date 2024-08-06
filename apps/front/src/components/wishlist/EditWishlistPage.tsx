import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Tab, Tabs } from '@mui/material'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useWishlistById } from '../../hooks/domain/useWishlistById'
import { useCustomSearchParams } from '../../hooks/useCustomSearchParams'
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

type SearchParamType = { tab: TabValues }

export const EditWishlistPage = () => {
  const params = useParams<'wishlistId'>()
  const wishlistId = params.wishlistId || ''
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0].value })
  const { wishlist, loading } = useWishlistById(wishlistId)

  return (
    <Box>
      <Loader loading={loading}>
        {!wishlist && <WishlistNotFound />}
        {wishlist && (
          <>
            <Title smallMarginBottom goBackLink={{ to: `/wishlists/${wishlistId}`, title: 'Revenir à la liste' }}>
              Modifier la liste
            </Title>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
              <Tabs
                value={queryParams.tab}
                onChange={(_, newValue) => setQueryParams({ tab: newValue })}
                variant="fullWidth"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                {tabs.map(tab => (
                  <Tab key={tab.value} value={tab.value} label={tab.label} iconPosition="start" icon={tab.icon} />
                ))}
              </Tabs>
            </Box>
            {queryParams.tab === TabValues.informations && <EditWishlistInformations wishlist={wishlist} />}
            {queryParams.tab === TabValues.events && (
              <EditWishlistEvent wishlistId={wishlist.id} events={wishlist.events} />
            )}
          </>
        )}
      </Loader>
    </Box>
  )
}
