import ForestIcon from '@mui/icons-material/Forest'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PeopleIcon from '@mui/icons-material/People'
import { Box, Tab, Tabs } from '@mui/material'
import { useParams } from 'react-router-dom'

import { useCustomSearchParams, useEventById } from '../../hooks'
import { Loader } from '../common/Loader'
import { Title } from '../common/Title'
import { EditEventAttendees } from './EditEventAttendees'
import { EditEventInformations } from './EditEventInformations'
import { EditSecretSanta } from './EditSecretSanta'
import { EventNotFound } from './EventNotFound'

enum TabValues {
  informations = 'informations',
  attendees = 'attendees',
  secretSanta = 'secret_santa',
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
  {
    value: TabValues.secretSanta,
    label: 'Secret Santa',
    icon: <ForestIcon />,
  },
]

type SearchParamType = { tab: TabValues }

export const EditEventPage = () => {
  const params = useParams<'eventId'>()
  const eventId = params.eventId || ''
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0]!.value })
  const { event, loading, currentUserCanEdit } = useEventById(eventId)

  return (
    <Box>
      <Loader loading={loading}>
        {(!event || !currentUserCanEdit) && <EventNotFound />}
        {event && currentUserCanEdit && (
          <>
            <Title smallMarginBottom>Modifier l'évènement</Title>
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
            <>
              {queryParams.tab === TabValues.informations && <EditEventInformations event={event} />}
              {queryParams.tab === TabValues.attendees && (
                <EditEventAttendees eventId={event.id} attendees={event.attendees} />
              )}
              {queryParams.tab === TabValues.secretSanta && <EditSecretSanta eventId={event.id} />}
            </>
          </>
        )}
      </Loader>
    </Box>
  )
}
