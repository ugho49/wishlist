import type { RootState } from '../../core'
import type { GqlWishlist, GqlWishlistItem } from './WishlistPage'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Box, Fade, Grid, IconButton, Modal, Stack, useMediaQuery, useTheme } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { FabAutoGrow } from '../common/FabAutoGrow'
import { ItemCard } from '../item/ItemCard'
import { ItemFormDialog } from '../item/ItemFormDialog'
import { EmptyItemsState } from './EmptyItemsState'
import { applyFilter, applySort } from './WishlistFilterAndSortItems'

export type WishlistTabItemsProps = {
  wishlist: GqlWishlist
  hasImportableItems: boolean
  onImportItems: () => void
}

// Image modal component
const ImageModal = ({
  imageUrl,
  itemUrl,
  open,
  onClose,
}: {
  imageUrl?: string
  itemUrl?: string
  open: boolean
  onClose: () => void
}) => {
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.only('xs'))

  return (
    <Modal open={open} onClose={onClose} autoFocus={false} disableAutoFocus>
      <Fade in={open}>
        <Stack
          alignItems="center"
          gap={2}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <img
              onClick={onClose}
              src={imageUrl}
              alt="item"
              style={{
                maxWidth: smallScreen ? '80vw' : '60vw',
                maxHeight: smallScreen ? '80vh' : '60vh',
                cursor: 'pointer',
              }}
            />
          </Box>

          <Stack direction="row" gap={2}>
            <IconButton
              aria-label="close"
              size="large"
              onClick={onClose}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: '50%',
                ':hover': {
                  bgcolor: theme.palette.grey[200],
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            {itemUrl && (
              <IconButton
                aria-label="open link"
                href={itemUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="large"
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  borderRadius: '50%',
                  ':hover': {
                    bgcolor: theme.palette.grey[200],
                  },
                }}
              >
                <OpenInNewIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Fade>
    </Modal>
  )
}

const mapState = (state: RootState) => state.auth.user?.id

export const WishlistItems = ({ wishlist, hasImportableItems, onImportItems }: WishlistTabItemsProps) => {
  const currentUserId = useSelector(mapState)
  const {
    displayAddItemFormDialog: openItemFormDialog,
    sort,
    filter,
  } = useSearch({
    from: '/_authenticated/_with-layout/wishlists/$wishlistId/',
  })
  const nbOfItems = useMemo(() => wishlist.items.length, [wishlist.items])
  const ownerOrCoOwnerOfTheList = currentUserId === wishlist.ownerId || wishlist.coOwnerId === currentUserId
  const [currentItem, setCurrentItem] = useState<GqlWishlistItem | null>(null)
  const navigate = useNavigate({ from: '/wishlists/$wishlistId' })

  const setOpenItemFormDialog = (open: boolean) => {
    void navigate({ search: prev => ({ ...prev, displayAddItemFormDialog: open }) })
  }

  // Apply filter and sort to items
  const itemsFilteredAndSorted = useMemo(() => {
    return wishlist.items.filter(item => applyFilter(item, filter)).sort((a, b) => applySort(a, b, sort))
  }, [wishlist.items, filter, sort])

  return (
    <Box className="items">
      {nbOfItems > 0 && (
        <>
          <Grid container spacing={3}>
            {itemsFilteredAndSorted.map(item => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                <ItemCard
                  wishlist={{
                    id: wishlist.id,
                    ownerId: wishlist.ownerId,
                    coOwnerId: wishlist.coOwnerId,
                    hideItems: wishlist.config.hideItems,
                  }}
                  item={item}
                  onImageClick={() => setCurrentItem(item)}
                />
              </Grid>
            ))}
          </Grid>

          <FabAutoGrow
            label={ownerOrCoOwnerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
            icon={<AddIcon />}
            color="primary"
            onClick={() => setOpenItemFormDialog(true)}
          />
        </>
      )}

      {nbOfItems === 0 && (
        <EmptyItemsState
          onAddItem={() => setOpenItemFormDialog(true)}
          isOwner={ownerOrCoOwnerOfTheList}
          hasImportableItems={hasImportableItems}
          onImportItems={onImportItems}
        />
      )}

      <ItemFormDialog
        mode="create"
        title={ownerOrCoOwnerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
        wishlistId={wishlist.id}
        open={openItemFormDialog}
        handleClose={() => setOpenItemFormDialog(false)}
      />

      {/* Image modal */}
      <ImageModal
        imageUrl={currentItem?.pictureUrl ?? undefined}
        itemUrl={currentItem?.url ?? undefined}
        open={!!currentItem}
        onClose={() => setCurrentItem(null)}
      />
    </Box>
  )
}
