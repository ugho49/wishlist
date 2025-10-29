import type { DetailedEventDto } from '@wishlist/common'

import AddIcon from '@mui/icons-material/Add'
import { Box, Grid } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import { FabAutoGrow } from '../common/FabAutoGrow'
import { EmptyListsState } from '../wishlist/EmptyListsState'
import { WishlistCardWithOwner } from '../wishlist/WishlistCardWithOwner'

export type EventWishlistsProps = {
  event: DetailedEventDto
}

export const EventWishlists = ({ event }: EventWishlistsProps) => {
  const nbOfItems = useMemo(() => event.wishlists.length, [event])
  const navigate = useNavigate()

  const handleAddList = () => navigate({ to: '/wishlists/new', search: { fromEvent: event.id } })

  return (
    <Box className="wishlists">
      {nbOfItems > 0 && (
        <>
          <Grid container spacing={3}>
            {event.wishlists
              .sort((a, b) => a.title.localeCompare(b.title))
              .map(wishlist => (
                <Grid key={wishlist.id} size={{ xs: 12, md: 6, xl: 4 }}>
                  <WishlistCardWithOwner wishlist={wishlist} />
                </Grid>
              ))}
          </Grid>

          <FabAutoGrow label="Ajouter une liste" color="primary" icon={<AddIcon />} onClick={() => handleAddList()} />
        </>
      )}

      {nbOfItems === 0 && (
        <EmptyListsState
          sx={{ marginTop: '50px' }}
          onAddListClick={() => handleAddList()}
          title="Aucune liste pour le moment"
          subtitle="Créez votre première liste de souhaits pour cet événement et partagez vos envies !"
        />
      )}
    </Box>
  )
}
