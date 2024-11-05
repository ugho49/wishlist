import type { RootState } from '../../core'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EditIcon from '@mui/icons-material/Edit'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import PublicIcon from '@mui/icons-material/Public'
import { Avatar, Box, Chip, Stack, Tooltip } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { useWishlistById } from '../../hooks/domain/useWishlistById'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { WishlistEventsDialog } from './WishlistEventsDialog'
import { WishlistItems } from './WishlistItems'
import { WishlistNotFound } from './WishlistNotFound'

const mapState = (state: RootState) => state.auth.user?.id

export const WishlistPage = () => {
  const currentUserId = useSelector(mapState)
  const [openEventDialog, setOpenEventDialog] = useState(false)
  const params = useParams<'wishlistId'>()
  const wishlistId = params.wishlistId || ''
  const navigate = useNavigate()

  const { wishlist, loading } = useWishlistById(wishlistId)

  const currentUserCanEdit = useMemo(() => wishlist?.owner.id === currentUserId, [currentUserId, wishlist])

  return (
    <Box>
      <Loader loading={loading}>
        {!wishlist && <WishlistNotFound />}

        {wishlist && (
          <>
            <Title smallMarginBottom>{wishlist.title}</Title>

            <Stack
              direction="column"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              sx={{ marginBottom: '20px' }}
              gap={1}
            >
              <Stack direction="row" gap={1}>
                {!wishlist.config.hide_items && (
                  <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
                    <Chip label="Publique" color="primary" variant="outlined" size="small" icon={<PublicIcon />} />
                  </Tooltip>
                )}
                <Chip
                  variant="outlined"
                  size="small"
                  avatar={
                    wishlist.owner.picture_url ? (
                      <Avatar src={wishlist.owner.picture_url} />
                    ) : (
                      <PersonOutlineOutlinedIcon />
                    )
                  }
                  label={`Créée par ${wishlist.owner.firstname} ${wishlist.owner.lastname}`}
                />
                <Chip
                  variant="outlined"
                  size="small"
                  icon={<CalendarMonthIcon />}
                  onClick={() => setOpenEventDialog(true)}
                  label={`${wishlist.events.length} ${wishlist.events.length > 1 ? 'évènements' : 'évènement'}`}
                />
              </Stack>
              {currentUserCanEdit && (
                <Stack direction="row" gap={1}>
                  <Chip
                    color="info"
                    variant="outlined"
                    size="small"
                    icon={<EditIcon />}
                    onClick={() => navigate(`/wishlists/${wishlistId}/edit`)}
                    label="Modifier"
                  />
                </Stack>
              )}
            </Stack>

            {wishlist.description && <Description text={wishlist.description} />}

            <WishlistItems wishlist={wishlist} />

            <WishlistEventsDialog
              open={openEventDialog}
              handleClose={() => setOpenEventDialog(false)}
              wishlistId={wishlist.id}
              events={wishlist.events}
              currentUserCanEdit={currentUserCanEdit}
            />
          </>
        )}
      </Loader>
    </Box>
  )
}
