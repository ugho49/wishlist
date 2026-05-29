import AddIcon from '@mui/icons-material/Add'
import { Box, Grid } from '@mui/material'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { useWishlistListPageQuery } from '../../gql'
import { unwrapResult } from '../../gql/result'
import { FabAutoGrow } from '../common/FabAutoGrow'
import { Loader } from '../common/Loader'
import { Pagination } from '../common/Pagination'
import { Title } from '../common/Title'
import { EmptyListsState } from './EmptyListsState'
import { WishlistCardWithEvents } from './WishlistCardWithEvents'

export const WishlistListPage = () => {
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/wishlists/' })
  const { data, isLoading: loading } = useWishlistListPageQuery(
    { filters: { page: currentPage } },
    { select: d => unwrapResult(d.wishlists, 'GetWishlistsPagedResponse') },
  )
  const navigate = useNavigate()

  const totalElements = data?.pagination.totalElements ?? 0
  const totalPages = data?.pagination.totalPages

  const handleAddList = () => navigate({ to: '/wishlists/new' })

  return (
    <Box>
      {totalElements > 0 && <Title>Mes listes</Title>}

      <Loader loading={loading}>
        <Grid container spacing={3}>
          {(data?.data ?? []).map(wishlist => (
            <Grid key={wishlist.id} size={{ xs: 12, lg: 6 }}>
              <WishlistCardWithEvents wishlist={wishlist} />
            </Grid>
          ))}
        </Grid>
      </Loader>

      {totalElements > 0 && (
        <>
          <Pagination
            totalPage={totalPages}
            currentPage={currentPage}
            disabled={loading}
            hide={totalPages === 1}
            onChange={value => navigate({ from: '/wishlists', search: prev => ({ ...prev, page: value }) })}
          />

          <FabAutoGrow label="Créer une liste" icon={<AddIcon />} color="primary" onClick={() => handleAddList()} />
        </>
      )}

      {totalElements === 0 && !loading && (
        <EmptyListsState
          sx={{ marginTop: '100px' }}
          onAddListClick={() => handleAddList()}
          title="Aucune liste pour le moment"
          subtitle="Créez votre première liste de souhaits et partagez vos envies !"
        />
      )}
    </Box>
  )
}
