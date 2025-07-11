import type { WishlistWithEventsDto } from '@wishlist/common'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import PublicIcon from '@mui/icons-material/Public'
import { Chip, Stack, styled } from '@mui/material'
import clsx from 'clsx'
import { DateTime } from 'luxon'

import { Card } from '../common/Card'

export type WishlistCardWithEventsProps = {
  wishlist: WishlistWithEventsDto
}

const CardStyled = styled(Card)({
  height: '100%',
  ['&.disabled']: {
    backgroundColor: '#f7f7f7',
    '& > *': {
      opacity: '.6',
    },
  },
})

const Wishlist = styled('div')(({ theme }) => ({
  color: theme.palette.text.secondary,
  flexGrow: 1,
  width: '95%',
  paddingRight: '10px',
  letterSpacing: '0.05em',
}))

const WishlistTitle = styled('span')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 400,
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
}))

const Arrow = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.palette.primary.light,
  alignItems: 'center',
  flexBasis: '5%',
}))

export const WishlistCardWithEvents = ({ wishlist }: WishlistCardWithEventsProps) => {
  const past =
    wishlist.events.filter(e => DateTime.fromISO(e.event_date) < DateTime.now().minus({ days: 1 })).length ===
    wishlist.events.length

  return (
    <CardStyled to={`/wishlists/${wishlist.id}`} className={clsx(past && 'disabled', 'animated fadeIn fast')}>
      <Stack direction="row" justifyContent="space-between" height="100%">
        <Wishlist>
          <Stack direction="row" alignItems="center" justifyContent="center" marginBottom="10px" gap={1}>
            {!wishlist.config.hide_items && <PublicIcon fontSize="small" color="primary" />}
            <WishlistTitle>{wishlist.title}</WishlistTitle>
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center" flexWrap="wrap" gap={1} marginTop="14px">
            {wishlist.events.map(event => (
              <Chip
                key={event.id}
                color="default"
                size="small"
                icon={<CalendarMonthIcon />}
                sx={{ cursor: 'pointer' }}
                label={event.title}
              />
            ))}
          </Stack>
        </Wishlist>
        <Arrow>
          <KeyboardArrowRightIcon />
        </Arrow>
      </Stack>
    </CardStyled>
  )
}
