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
import { EmptyEventsState } from './EmptyEventsState'
import { EventCard } from './EventCard'

const CREATE_EVENT_ROUTE = '/events/new'

export const EventListPage = () => {
  const api = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(1))
  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['events', { page: currentPage }],
    queryFn: ({ signal }) => api.event.getAll({ p: currentPage }, { signal }),
  })

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements)
    }
  }, [value])

  return (
    <Box>
      {totalElements > 0 && <Title>Évènements</Title>}

      <Loader loading={loading}>
        <Grid container spacing={3}>
          {(value?.resources || []).map(event => (
            <Grid key={event.id} size={{ xs: 12, lg: 6 }}>
              <EventCard event={event} />
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

          <FabAutoGrow label="Créer un évènement" icon={<AddIcon />} color="primary" to={CREATE_EVENT_ROUTE} />
        </>
      )}

      {totalElements === 0 && !loading && (
        <EmptyEventsState sx={{ marginTop: '100px' }} addEventRoute={CREATE_EVENT_ROUTE} />
      )}
    </Box>
  )
}
