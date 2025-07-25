import type { EventWithCountsDto } from '@wishlist/common'

import { styled } from '@mui/material'
import clsx from 'clsx'
import { DateTime } from 'luxon'

import { Card } from '../common/Card'
import { EventIcon } from './EventIcon'

const EventCardContent = styled(Card)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100px',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
  ['&.disabled']: {
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.grey[200]}`,
    color: theme.palette.text.disabled,
    filter: 'grayscale(100%)',
    '&:hover': {
      transform: 'none',
      boxShadow: theme.shadows[1],
      borderColor: theme.palette.grey[300],
    },
    '& .event-title': {
      color: theme.palette.text.disabled,
      textDecoration: 'line-through',
    },
    '& .event-date': {
      color: theme.palette.text.disabled,
    },
    '& .event-icon': {
      opacity: 0.4,
      filter: 'grayscale(100%)',
    },
    '& .event-infos': {
      color: theme.palette.text.disabled,
      borderTopColor: theme.palette.grey[200],
    },
  },
}))

const EventHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '12px',
})

const EventTextContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
})

const EventTitle = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '2px',
}))

const EventDate = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
  fontWeight: 400,
}))

const EventInfos = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  marginTop: 'auto',
  paddingTop: '12px',
  borderTop: `1px solid ${theme.palette.divider}`,
}))

const EventInfoItem = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

export type EventCardProps = {
  event: EventWithCountsDto
}

export const EventCard = ({ event }: EventCardProps) => {
  const numberOfAttendees = event.attendees.length
  const past = DateTime.fromISO(event.event_date) < DateTime.now().minus({ days: 1 })

  return (
    <EventCardContent
      to={`/events/${event.id}`}
      className={clsx(past && 'disabled', 'animated fadeIn fast')}
      biggerPaddingInDesktop={false}
    >
      <EventHeader>
        <EventIcon icon={event.icon} className="event-icon" />
        <EventTextContent>
          <EventTitle className="event-title">{event.title}</EventTitle>
          <EventDate className="event-date">
            {DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}
          </EventDate>
        </EventTextContent>
      </EventHeader>

      <EventInfos className="event-infos">
        <EventInfoItem>
          {numberOfAttendees} {numberOfAttendees > 1 ? 'participants' : 'participant'}
        </EventInfoItem>
        <EventInfoItem>
          {event.nb_wishlists} {event.nb_wishlists > 1 ? 'listes' : 'liste'}
        </EventInfoItem>
      </EventInfos>
    </EventCardContent>
  )
}
