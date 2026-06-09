import type { EventId } from '@wishlist/common'
import type { EventWishlist } from './event.types'

import AddIcon from '@mui/icons-material/Add'
import { Box, Grid } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'

import { FabAutoGrow } from '../common/FabAutoGrow'
import { EmptyListsState } from '../wishlist/EmptyListsState'
import { WishlistCardWithOwner } from '../wishlist/WishlistCardWithOwner'

export type EventWishlistsProps = {
  eventId: EventId
  wishlists: EventWishlist[]
}

export const EventWishlists = ({ eventId, wishlists }: EventWishlistsProps) => {
  const navigate = useNavigate()

  const handleAddList = () => navigate({ to: '/wishlists/new', search: { fromEvent: eventId } })

  return (
    <Box className="wishlists">
      {wishlists.length > 0 && (
        <>
          <Grid container spacing={3}>
            {[...wishlists]
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

      {wishlists.length === 0 && (
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
