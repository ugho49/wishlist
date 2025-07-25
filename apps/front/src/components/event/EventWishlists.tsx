import type { DetailedEventDto } from '@wishlist/common'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Grid, Stack } from '@mui/material'
import { useMemo } from 'react'

import { FabAutoGrow } from '../common/FabAutoGrow'
import { RouterLink } from '../common/RouterLink'
import { WishlistCardWithOwner } from '../wishlist/WishlistCardWithOwner'

export type EventWishlistsProps = {
  event: DetailedEventDto
}

export const EventWishlists = ({ event }: EventWishlistsProps) => {
  const nbOfItems = useMemo(() => event.wishlists.length, [event])
  const addListRoute = useMemo(() => `/wishlists/new?from-event=${event.id}`, [event])

  return (
    <Box className="wishlists">
      {nbOfItems > 0 && (
        <>
          <Grid container spacing={3}>
            {event.wishlists
              .sort((a, b) => a.title.localeCompare(b.title))
              .map(wishlist => (
                <Grid key={wishlist.id} size={{ xs: 12, lg: 6 }}>
                  <WishlistCardWithOwner wishlist={wishlist} />
                </Grid>
              ))}
          </Grid>

          <FabAutoGrow label="Ajouter une liste" color="primary" icon={<AddIcon />} to={addListRoute} />
        </>
      )}

      {nbOfItems === 0 && (
        <Stack alignItems="center" gap={2} sx={{ marginTop: '50px' }}>
          <Button component={RouterLink} variant="contained" color="primary" to={addListRoute}>
            Ajouter une liste
          </Button>
          <span>Cet évènement ne contient aucune liste.</span>
        </Stack>
      )}
    </Box>
  )
}
