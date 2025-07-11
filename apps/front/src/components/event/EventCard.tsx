import type { EventWithCountsDto } from '@wishlist/common'

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { styled } from '@mui/material'
import clsx from 'clsx'
import { DateTime } from 'luxon'

import { Card } from '../common/Card'

const EventCardContent = styled(Card)({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  ['&.disabled']: {
    backgroundColor: '#f7f7f7',
    '& > *': {
      opacity: '.6',
    },
  },
})

const EventContent = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  flexGrow: 1,
  width: '95%',
  paddingRight: '10px',
  letterSpacing: '0.05em',
}))

const EventTitle = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 400,
  marginBottom: '10px',
  textAlign: 'center',
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
}))

const EventInfos = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
  fontWeight: 300,
})

const Arrow = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.palette.primary.light,
  alignItems: 'center',
  flexBasis: '5%',
}))

export type EventCardProps = {
  event: EventWithCountsDto
}

export const EventCard = ({ event }: EventCardProps) => {
  const numberOfAttendees = event.attendees.length
  const past = DateTime.fromISO(event.event_date) < DateTime.now().minus({ days: 1 })

  return (
    <EventCardContent to={`/events/${event.id}`} className={clsx(past && 'disabled', 'animated fadeIn fast')}>
      <EventContent>
        <EventTitle>{event.title}</EventTitle>
        <EventInfos>
          <div>
            {numberOfAttendees} {numberOfAttendees > 1 ? 'participants' : 'participant'}
          </div>
          <div>
            {event.nb_wishlists} {event.nb_wishlists > 1 ? 'listes' : 'liste'}
          </div>
          <div>{DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_MED)}</div>
        </EventInfos>
      </EventContent>
      <Arrow>
        <KeyboardArrowRightIcon />
      </Arrow>
    </EventCardContent>
  )
}
