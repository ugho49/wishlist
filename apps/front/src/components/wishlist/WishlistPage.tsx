import type { RootState } from '../../core'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import EditIcon from '@mui/icons-material/Edit'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import PublicIcon from '@mui/icons-material/Public'
import { Avatar, Box, Chip, Container, Stack, Tooltip } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { useApi, useWishlistById } from '../../hooks'
import { Description } from '../common/Description'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { ImportItemsDialog } from '../item/ImportItemsDialog'
import { WishlistEventsDialog } from './WishlistEventsDialog'
import { WishlistItems } from './WishlistItems'
import { WishlistNotFound } from './WishlistNotFound'

const mapState = (state: RootState) => state.auth.user?.id

const logoSize = 60
const getImportDialogKey = (wishlistId: string) => `wishlist-import-dialog-auto-shown-${wishlistId}`

export const WishlistPage = () => {
  const currentUserId = useSelector(mapState)
  const [openEventDialog, setOpenEventDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [hasCheckedImport, setHasCheckedImport] = useState(false)
  const params = useParams<'wishlistId'>()
  const wishlistId = params.wishlistId || ''
  const navigate = useNavigate()
  const api = useApi()

  const { wishlist, loading } = useWishlistById(wishlistId)

  const currentUserCanEdit = useMemo(() => wishlist?.owner.id === currentUserId, [currentUserId, wishlist])

  // Check for importable items only if it's the user's own wishlist
  const { data: importableItems = [] } = useQuery({
    queryKey: ['item.importable'],
    queryFn: () => api.item.getImportableItems(),
    enabled: currentUserCanEdit,
  })

  // Show import dialog automatically only if:
  // - The wishlist is empty
  // - There are items to import
  // - The user has never seen the auto-dialog for this specific wishlist (checked via localStorage)
  useEffect(() => {
    if (wishlist && currentUserCanEdit && !hasCheckedImport && importableItems.length > 0) {
      const hasNoItems = wishlist.items.length === 0
      const storageKey = getImportDialogKey(wishlistId)
      const hasSeenAutoDialog = localStorage.getItem(storageKey) === 'true'

      if (hasNoItems && !hasSeenAutoDialog) {
        setShowImportDialog(true)
        // Mark that the user has seen the auto-dialog for this wishlist
        localStorage.setItem(storageKey, 'true')
      }
      setHasCheckedImport(true)
    }
  }, [wishlist, currentUserCanEdit, importableItems, hasCheckedImport, wishlistId])

  return (
    <Box>
      <Loader loading={loading}>
        {!wishlist && <WishlistNotFound />}

        {wishlist && (
          <>
            <Title smallMarginBottom>
              <Stack
                direction="row"
                gap={2}
                alignItems="center"
                flexWrap="wrap"
                justifyContent="center"
                textAlign="center"
              >
                <Avatar
                  src={wishlist.logo_url ?? wishlist.owner.picture_url}
                  sx={{ width: logoSize, height: logoSize, bgcolor: grey[200], color: grey[400] }}
                >
                  <PersonIcon fontSize="medium" />
                </Avatar>
                <span>{wishlist.title}</span>
              </Stack>
            </Title>

            <Stack
              direction="column"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              sx={{ marginBottom: '20px' }}
              gap={1}
            >
              <Stack direction="row" gap={1}>
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
                  {!wishlist.config.hide_items && (
                    <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
                      <Chip label="Publique" color="primary" variant="outlined" size="small" icon={<PublicIcon />} />
                    </Tooltip>
                  )}
                  {importableItems.length > 0 && (
                    <Chip
                      color="secondary"
                      variant="outlined"
                      size="small"
                      icon={<HistoryIcon />}
                      onClick={() => setShowImportDialog(true)}
                      label={`Importer (${importableItems.length})`}
                    />
                  )}
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

            <Container maxWidth="lg">
              <Stack gap="20px">
                {wishlist.description && <Description text={wishlist.description} />}

                <WishlistItems wishlist={wishlist} />
              </Stack>
            </Container>

            <WishlistEventsDialog
              open={openEventDialog}
              handleClose={() => setOpenEventDialog(false)}
              wishlistId={wishlist.id}
              events={wishlist.events}
              currentUserCanEdit={currentUserCanEdit}
            />

            {currentUserCanEdit && (
              <ImportItemsDialog
                open={showImportDialog}
                wishlistId={wishlist.id}
                onClose={() => setShowImportDialog(false)}
                onComplete={() => setShowImportDialog(false)}
              />
            )}
          </>
        )}
      </Loader>
    </Box>
  )
}
