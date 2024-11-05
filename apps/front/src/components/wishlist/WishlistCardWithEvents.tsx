import type { Theme } from '@mui/material'
import type { WishlistWithEventsDto } from '@wishlist/common-types'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import PublicIcon from '@mui/icons-material/Public'
import { Chip, Stack } from '@mui/material'
import { makeStyles } from '@mui/styles'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import React from 'react'

import { Card } from '../common/Card'

export type WishlistCardWithEventsProps = {
  wishlist: WishlistWithEventsDto
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    height: '100%',
  },
  wishlist: {
    color: theme.palette.text.secondary,
    flexGrow: 1,
    width: '95%',
    paddingRight: '10px',
    letterSpacing: '0.05em',
  },
  title: {
    color: theme.palette.primary.main,
    fontWeight: 400,
    overflow: 'hidden',
    maxWidth: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
  arrow: {
    display: 'flex',
    color: theme.palette.primary.light,
    alignItems: 'center',
    flexBasis: '5%',
  },
  disabled: {
    backgroundColor: '#f7f7f7',
    '& > *': {
      opacity: '.6',
    },
  },
}))

export const WishlistCardWithEvents = ({ wishlist }: WishlistCardWithEventsProps) => {
  const classes = useStyles()
  const past =
    wishlist.events.filter(e => DateTime.fromISO(e.event_date) < DateTime.now().minus({ days: 1 })).length ===
    wishlist.events.length

  return (
    <Card
      to={`/wishlists/${wishlist.id}`}
      className={clsx(classes.card, past && classes.disabled, 'animated fadeIn fast')}
    >
      <Stack direction="row" justifyContent="space-between" height="100%">
        <div className={classes.wishlist}>
          <Stack direction="row" alignItems="center" justifyContent="center" marginBottom="10px" gap={1}>
            {!wishlist.config.hide_items && <PublicIcon fontSize="small" color="primary" />}
            <span className={classes.title}>{wishlist.title}</span>
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
        </div>
        <div className={classes.arrow}>
          <KeyboardArrowRightIcon />
        </div>
      </Stack>
    </Card>
  )
}
