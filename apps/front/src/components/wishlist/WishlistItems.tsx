import type { DetailedWishlistDto, ItemDto } from '@wishlist/common-types'

import type { RootState } from '../../core'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Grid, Stack } from '@mui/material'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { FabAutoGrow } from '../common/FabAutoGrow'
import { ItemCard } from '../item/ItemCard'
import { ItemFormDialog } from '../item/ItemFormDialog'
import { FilterType, SortType, WishlistFilterAndSortItems } from './WishlistFilterAndSortItems'

export type WishlistTabItemsProps = {
  wishlist: DetailedWishlistDto
}

const mapState = (state: RootState) => state.auth.user?.id

export const WishlistItems = ({ wishlist }: WishlistTabItemsProps) => {
  const currentUserId = useSelector(mapState)
  const [openItemFormDialog, setOpenItemFormDialog] = useState(false)
  const [sort, setSort] = useState<SortType>(SortType.CREATED_AT_DESC)
  const [filter, setFilter] = useState<FilterType>(FilterType.NONE)
  const [itemsFilteredAndSorted, setItemsFilteredAndSorted] = useState<ItemDto[]>([])
  const nbOfItems = useMemo(() => wishlist.items.length, [wishlist.items])
  const ownerOfTheList = currentUserId === wishlist.owner.id

  const addItem = () => {
    setOpenItemFormDialog(true)
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
              <Grid item xs={6} md={4} lg={3} key={item.id}>
                <ItemCard
                  wishlist={{ id: wishlist.id, ownerId: wishlist.owner.id, hideItems: wishlist.config.hide_items }}
                  item={item}
                />
              </Grid>
            ))}
          </Grid>

          <FabAutoGrow
            label={ownerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
            icon={<AddIcon />}
            color="secondary"
            onClick={() => addItem()}
          />
        </>
      )}

      {nbOfItems === 0 && (
        <Stack alignItems="center" gap={2} sx={{ marginTop: '50px' }}>
          <Button variant="contained" color="secondary" onClick={() => addItem()}>
            Ajouter un souhait
          </Button>
          <span>Cette liste ne contient aucun souhait.</span>
        </Stack>
      )}

      <ItemFormDialog
        mode="create"
        title={ownerOfTheList ? 'Ajouter un souhait' : 'Suggérer un souhait'}
        wishlistId={wishlist.id}
        open={openItemFormDialog}
        handleClose={() => setOpenItemFormDialog(false)}
      />
    </Box>
  )
}
