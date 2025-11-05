import type { WishlistWithEventsDto } from '@wishlist/common'
import type { RootState } from '../../core'

import PublicIcon from '@mui/icons-material/Public'
import { Avatar, styled, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { parseISO } from '@wishlist/common'
import clsx from 'clsx'
import { isAfter, subDays } from 'date-fns'
import { useSelector } from 'react-redux'

import { Card } from '../common/Card'
import { EventIcon } from '../event/EventIcon'

export type WishlistCardWithEventsProps = {
  wishlist: WishlistWithEventsDto
}

const WishlistCardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100px',
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  padding: 16,
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&.disabled': {
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.grey[200],
    color: theme.palette.text.disabled,
    filter: 'grayscale(100%)',
    '&:hover': {
      borderColor: theme.palette.grey[300],
    },
    '& .wishlist-title': {
      color: theme.palette.text.disabled,
      textDecoration: 'line-through',
    },
    '& .wishlist-icon': {
      opacity: 0.4,
      filter: 'grayscale(100%)',
    },
    '& .wishlist-events': {
      color: theme.palette.text.disabled,
      borderTopColor: theme.palette.grey[200],
      '& .MuiChip-root': {
        backgroundColor: theme.palette.grey[100],
        color: theme.palette.text.disabled,
        '& .MuiSvgIcon-root': {
          color: theme.palette.text.disabled,
        },
      },
    },
  },
}))

const WishlistHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  marginBottom: '16px',
})

const WishlistLogo = styled(Avatar)(({ theme }) => ({
  width: '32px',
  height: '32px',
  backgroundColor: theme.palette.primary.light,
  fontSize: '1rem',
}))

const WishlistTitleContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
})

const WishlistTitle = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'center',
  maxWidth: '100%',
}))

const PublicIndicator = styled(PublicIcon)(({ theme }) => ({
  fontSize: '14px',
  color: theme.palette.text.secondary,
  marginLeft: '6px',
  opacity: 0.7,
}))

const WishlistEvents = styled('div')(({ theme }) => ({
  marginTop: 'auto',
  paddingTop: '12px',
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
}))

const EventItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  flexShrink: 0,
}))

const EventName = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '380px',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '500px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '260px',
  },
}))

const MoreEventsIndicator = styled('span')(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.disabled,
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
  textAlign: 'center',
}))

export const WishlistCardWithEvents = ({ wishlist }: WishlistCardWithEventsProps) => {
  const userProfile = useSelector((state: RootState) => state.userProfile)
  const navigate = useNavigate()
  const past =
    wishlist.events.filter(e => !isAfter(parseISO(e.event_date), subDays(new Date(), 1))).length ===
    wishlist.events.length

  const isPublic = !wishlist.config.hide_items
  const maxEventsToShow = 1
  const eventsToShow = wishlist.events
    .toSorted((a, b) => parseISO(a.event_date).getTime() - parseISO(b.event_date).getTime())
    .slice(0, maxEventsToShow)
  const remainingEventsCount = wishlist.events.length - maxEventsToShow

  return (
    <WishlistCardContent
      onClick={() => navigate({ to: '/wishlists/$wishlistId', params: { wishlistId: wishlist.id } })}
      className={clsx(past && 'disabled', 'animated fadeIn fast')}
      hoverable
    >
      <WishlistHeader>
        <WishlistLogo src={wishlist.logo_url ?? userProfile.pictureUrl} className="wishlist-icon">
          {wishlist.title.charAt(0).toUpperCase()}
        </WishlistLogo>
        <WishlistTitleContainer>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <WishlistTitle className="wishlist-title">{wishlist.title}</WishlistTitle>
            {isPublic && <PublicIndicator className="wishlist-icon" />}
          </div>
        </WishlistTitleContainer>
      </WishlistHeader>

      <WishlistEvents>
        {eventsToShow.map(event => (
          <EventItem key={event.id}>
            <EventIcon icon={event.icon} size="small" />
            <EventName>{event.title}</EventName>
          </EventItem>
        ))}
        {remainingEventsCount > 0 && (
          <MoreEventsIndicator>
            et {remainingEventsCount} autre{remainingEventsCount > 1 ? 's' : ''} événement
            {remainingEventsCount > 1 ? 's' : ''}
          </MoreEventsIndicator>
        )}
      </WishlistEvents>
    </WishlistCardContent>
  )
}
