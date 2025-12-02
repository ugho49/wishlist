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
import { EmptyEventsState } from './EmptyEventsState'
import { EventCard } from './EventCard'

export const EventListPage = () => {
  const api = useApi()
  const [totalElements, setTotalElements] = useState(0)
  const { page: currentPage } = useSearch({ from: '/_authenticated/_with-layout/events/' })
  const navigate = useNavigate()
  const { data: value, isLoading: loading } = useQuery({
    queryKey: ['events', { page: currentPage }],
    queryFn: ({ signal }) => api.event.getAll({ p: currentPage }, { signal }),
  })

  useEffect(() => {
    if (value) {
      setTotalElements(value.pagination.total_elements)
    }
  }, [value])

  const handleAddEventClick = () => navigate({ to: '/events/new' })

  return (
    <>
      <SEO
        title="Mes événements"
        description="Gérez tous vos événements et leurs listes de souhaits associées."
        canonical="/events"
        noindex
      />
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
              onChange={value => navigate({ from: '/events', search: prev => ({ ...prev, page: value }) })}
            />

            <FabAutoGrow
              label="Créer un évènement"
              icon={<AddIcon />}
              color="primary"
              onClick={() => handleAddEventClick()}
            />
          </>
        )}

        {totalElements === 0 && !loading && (
          <EmptyEventsState sx={{ marginTop: '100px' }} onAddEventClick={() => handleAddEventClick()} />
        )}
      </Box>
    </>
  )
}
