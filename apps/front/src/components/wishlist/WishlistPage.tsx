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
import { FeatureFlags, type WishlistId } from '@wishlist/common'
import { parseAsBoolean, useQueryState } from 'nuqs'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import { useApi, useWishlistById } from '../../hooks'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
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
  const importItemsEnabled = useFeatureFlag(FeatureFlags.FRONTEND_WISHLIST_IMPORT_ITEMS_ENABLED)
  const currentUserId = useSelector(mapState)
  const [showEventDialog, setShowEventDialog] = useQueryState('showEventDialog', parseAsBoolean.withDefault(false))
  const [showImportDialog, setShowImportDialog] = useQueryState('showImportDialog', parseAsBoolean.withDefault(false))
  const params = useParams<'wishlistId'>() as { wishlistId: WishlistId }
  const wishlistId = params.wishlistId
  const navigate = useNavigate()
  const api = useApi()

  const { wishlist, loading } = useWishlistById(wishlistId)

  const currentUserCanEdit = useMemo(() => wishlist?.owner.id === currentUserId, [currentUserId, wishlist])

  const { data: importableItems = [] } = useQuery({
    queryKey: ['item.importable', { wishlistId }],
    queryFn: () => api.item.getImportableItems({ wishlist_id: wishlistId }),
    enabled: currentUserCanEdit && importItemsEnabled,
  })

  useEffect(() => {
    if (!importItemsEnabled) return

    if (wishlist && currentUserCanEdit && importableItems.length > 0) {
      const hasNoItems = wishlist.items.length === 0
      const storageKey = getImportDialogKey(wishlist.id)
      const hasSeenAutoDialog = localStorage.getItem(storageKey) === 'true'

      if (hasNoItems && !hasSeenAutoDialog) {
        setShowImportDialog(true)
        // Mark that the user has seen the auto-dialog for this wishlist
        localStorage.setItem(storageKey, 'true')
      }
    }
  }, [wishlist, currentUserCanEdit, importableItems, setShowImportDialog, importItemsEnabled])

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
                  onClick={() => setShowEventDialog(true)}
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
              open={showEventDialog}
              handleClose={() => setShowEventDialog(false)}
              wishlistId={wishlist.id}
              events={wishlist.events}
              currentUserCanEdit={currentUserCanEdit}
            />

            {currentUserCanEdit && importableItems.length > 0 && (
              <ImportItemsDialog
                open={showImportDialog && importItemsEnabled}
                wishlistId={wishlist.id}
                importableItems={importableItems}
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
