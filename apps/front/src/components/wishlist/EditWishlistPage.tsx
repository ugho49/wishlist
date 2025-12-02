import type { WishlistId } from '@wishlist/common'
import type { RootState } from '../../core'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { Box, Container, Tab, Tabs } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { useWishlistById } from '../../hooks/domain/useWishlistById'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { SEO } from '../SEO'
import { EditWishlistEvent } from './EditWishlistEvents'
import { EditWishlistInformations } from './EditWishlistInformations'
import { EditWishlistManagement } from './EditWishlistManagement'
import { WishlistNotFound } from './WishlistNotFound'

export enum TabValues {
  informations = 'informations',
  events = 'events',
  management = 'management',
}

const BASE_TABS = [
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

const MANAGEMENT_TAB = {
  value: TabValues.management,
  label: 'Gestion',
  icon: <ManageAccountsIcon />,
}

const mapState = (state: RootState) => state.auth.user?.id

interface EditWishlistPageProps {
  wishlistId: WishlistId
}

export const EditWishlistPage = ({ wishlistId }: EditWishlistPageProps) => {
  const [tabs, setTabs] = useState(BASE_TABS)
  const { tab } = useSearch({ from: '/_authenticated/_with-layout/wishlists/$wishlistId/edit' })
  const { wishlist, loading, currentUserCanEdit } = useWishlistById(wishlistId)
  const currentUserId = useSelector(mapState)
  const navigate = useNavigate({ from: '/wishlists/$wishlistId/edit' })
  const isOwner = wishlist?.owner.id === currentUserId
  const isPublic = wishlist?.config.hide_items === false

  useEffect(() => {
    if (isPublic && isOwner) {
      setTabs(prev => [...prev, MANAGEMENT_TAB])
    }
  }, [isPublic, isOwner])

  return (
    <>
      <SEO
        title={`Modifier la liste de souhaits ${wishlist?.title || ''}`}
        description={`Modifier la liste de souhaits ${wishlist?.title || ''}.`}
        canonical={`/wishlists/${wishlistId}/edit`}
      />
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
              {tab === TabValues.management && <EditWishlistManagement wishlist={wishlist} />}
            </Container>
          )}
        </Loader>
      </Box>
    </>
  )
}
