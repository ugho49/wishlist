import type { DetailedWishlistDto, ItemDto } from '@wishlist/common'
import type { RootState } from '../../core'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Box, Fade, Grid, IconButton, Modal, Stack, useMediaQuery, useTheme } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { FabAutoGrow } from '../common/FabAutoGrow'
import { EmptyItemsState } from '../item/EmptyItemsState'
import { ItemCard } from '../item/ItemCard'
import { ItemFormDialog } from '../item/ItemFormDialog'
import { type FilterType, type SortType, WishlistFilterAndSortItems } from './WishlistFilterAndSortItems'

export type WishlistTabItemsProps = {
  wishlist: DetailedWishlistDto
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

export const WishlistItems = ({ wishlist }: WishlistTabItemsProps) => {
  const currentUserId = useSelector(mapState)
  const {
    displayAddItemFormDialog: openItemFormDialog,
    sort,
    filter,
  } = useSearch({ from: '/_authenticated/_with-layout/wishlists/$wishlistId/' })
  const [itemsFilteredAndSorted, setItemsFilteredAndSorted] = useState<ItemDto[]>([])
  const nbOfItems = useMemo(() => wishlist.items.length, [wishlist.items])
  const ownerOfTheList = currentUserId === wishlist.owner.id
  const [currentItem, setCurrentItem] = useState<ItemDto | null>(null)
  const navigate = useNavigate({ from: '/wishlists/$wishlistId' })

  const setOpenItemFormDialog = (open: boolean) => {
    void navigate({ search: prev => ({ ...prev, displayAddItemFormDialog: open }) })
  }

  const setSort = (newSort: SortType) => {
    void navigate({ search: prev => ({ ...prev, sort: newSort }) })
  }
  const setFilter = (newFilter: FilterType) => {
    void navigate({ search: prev => ({ ...prev, filter: newFilter }) })
  }

  return (
    <Box className="items">
      {nbOfItems > 0 && (
        <>
          <WishlistFilterAndSortItems
            displayFilterSelect={!ownerOfTheList}
            items={wishlist.items}
            sort={sort}
            filter={filter}
            onChange={newItems => setItemsFilteredAndSorted(newItems)}
            onSortChange={newSort => setSort(newSort)}
            onFilterChange={newFilter => setFilter(newFilter)}
          />

          <Grid container spacing={3}>
            {itemsFilteredAndSorted.map(item => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                <ItemCard
                  wishlist={{ id: wishlist.id, ownerId: wishlist.owner.id, hideItems: wishlist.config.hide_items }}
                  item={item}
                  onImageClick={() => setCurrentItem(item)}
                />
              </Grid>
            ))}
          </Grid>

          <FabAutoGrow
            label={ownerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
            icon={<AddIcon />}
            color="primary"
            onClick={() => setOpenItemFormDialog(true)}
          />
        </>
      )}

      {nbOfItems === 0 && (
        <EmptyItemsState
          sx={{ marginTop: '50px' }}
          onAddItem={() => setOpenItemFormDialog(true)}
          isOwner={ownerOfTheList}
        />
      )}

      <ItemFormDialog
        mode="create"
        title={ownerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
        wishlistId={wishlist.id}
        open={openItemFormDialog}
        handleClose={() => setOpenItemFormDialog(false)}
      />

      {/* Image modal */}
      <ImageModal
        imageUrl={currentItem?.picture_url}
        itemUrl={currentItem?.url}
        open={!!currentItem}
        onClose={() => setCurrentItem(null)}
      />
    </Box>
  )
}
