import AddIcon from '@mui/icons-material/Add'
import { Box, Grid } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { FabAutoGrow } from '../common/FabAutoGrow'
import { Loader } from '../common/Loader'
import { Pagination } from '../common/Pagination'
import { Title } from '../common/Title'
import { EmptyListsState } from './EmptyListsState'
import { WishlistCardWithEvents } from './WishlistCardWithEvents'

const CREATE_LIST_ROUTE = '/wishlists/new'

export const WishlistListPage = () => {
  const api = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['wishlists', { page: currentPage }],
    queryFn: ({ signal }) => api.wishlist.getAll({ p: currentPage }, { signal }),
  })

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements)
    }
  }, [value])

  return (
    <Box>
      {totalElements > 0 && <Title>Mes listes</Title>}

      <Loader loading={loading}>
        <Grid container spacing={3}>
          {(value?.resources || []).map(wishlist => (
            <Grid key={wishlist.id} size={{ xs: 12, lg: 6 }}>
              <WishlistCardWithEvents wishlist={wishlist} />
            </Grid>
          ))}
        </Grid>
      </Loader>

      {totalElements > 0 && (
        <>
          <Pagination
            totalPage={value?.pagination.total_pages}
            currentPage={currentPage}
            disabled={loading}
            hide={value?.pagination.total_pages === 1}
            onChange={value => setCurrentPage(value)}
          />

          <FabAutoGrow label="Créer une liste" icon={<AddIcon />} color="primary" to={CREATE_LIST_ROUTE} />
        </>
      )}

      {totalElements === 0 && !loading && (
        <EmptyListsState
          addListRoute={CREATE_LIST_ROUTE}
          title="Aucune liste pour le moment"
          subtitle="Créez votre première liste de souhaits et partagez vos envies !"
        />
      )}
    </Box>
  )
}
