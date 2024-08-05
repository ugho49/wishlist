import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Tab, Tabs } from '@mui/material'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useEventById } from '../../hooks/domain/useEventById'
import { useCustomSearchParams } from '../../hooks/useCustomSearchParams'
import { Card } from '../common/Card'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EditEventAttendees } from './EditEventAttendees'
import { EditEventInformations } from './EditEventInformations'
import { EventNotFound } from './EventNotFound'

enum TabValues {
  informations = 'informations',
  attendees = 'attendees',
}

const tabs = [
  {
    value: TabValues.informations,
    label: 'Informations',
    icon: <InfoOutlinedIcon />,
  },
  {
    value: TabValues.attendees,
    label: 'Participants',
    icon: <PeopleIcon />,
  },
]

type SearchParamType = { tab: TabValues }

export const EditEventPage = () => {
  const params = useParams<'eventId'>()
  const eventId = params.eventId || ''
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0].value })
  const { event, loading } = useEventById(eventId)

  return (
    <Box>
      <Loader loading={loading}>
        {!event && <EventNotFound />}{' '}
        {event && (
          <>
            <Title smallMarginBottom goBackLink={{ to: `/events/${eventId}`, title: "Revenir à l'évènement" }}>
              Modifier l'évènement
            </Title>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
              <Tabs
                value={queryParams.tab}
                onChange={(_, newValue) => setQueryParams({ tab: newValue })}
                variant="fullWidth"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                {tabs.map(tab => (
                  <Tab key={tab.value} value={tab.value} label={tab.label} iconPosition="start" icon={tab.icon} />
                ))}
              </Tabs>
            </Box>
            <Card>
              {queryParams.tab === TabValues.informations && <EditEventInformations event={event} />}
              {queryParams.tab === TabValues.attendees && (
                <EditEventAttendees eventId={event.id} attendees={event.attendees} />
              )}
            </Card>
          </>
        )}
      </Loader>
    </Box>
  )
}
