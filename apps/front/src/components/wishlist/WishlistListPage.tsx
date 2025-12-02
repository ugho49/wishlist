import AddIcon from '@mui/icons-material/Add'
import { Box, Grid } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useApi } from '../../hooks/useApi'
import { FabAutoGrow } from '../common/FabAutoGrow'
import { Loader } from '../common/Loader'
import { Pagination } from '../common/Pagination'
import { Title } from '../common/Title'
import { SEO } from '../SEO'
import { EmptyListsState } from './EmptyListsState'
import { WishlistCardWithEvents } from './WishlistCardWithEvents'

export const WishlistListPage = () => {
  const api = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/wishlists/' })
  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['wishlists', { page: currentPage }],
    queryFn: ({ signal }) => api.wishlist.getAll({ p: currentPage }, { signal }),
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements)
    }
  }, [value])

  const handleAddList = () => navigate({ to: '/wishlists/new' })

  return (
    <>
      <SEO
        title="Mes listes de souhaits"
        description="Gérez toutes vos listes de souhaits pour vos différents événements."
        canonical="/wishlists"
        noindex
      />
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
    </>
  )
}
