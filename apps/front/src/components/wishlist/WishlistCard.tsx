import React from 'react';
import { WishlistWithEventsDto, WishlistWithOwnerDto } from '@wishlist/common-types';
import { makeStyles } from '@mui/styles';
import { Card } from '../common/Card';
import { Avatar, Chip, Stack, Theme } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import clsx from 'clsx';
import { DateTime } from 'luxon';

export type WishlistCardProps = {
  wishlist: WishlistWithEventsDto | WishlistWithOwnerDto;
};

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
}));

export const WishlistCard = ({ wishlist }: WishlistCardProps) => {
  const classes = useStyles();
  const past =
    'events' in wishlist
      ? wishlist.events.filter((e) => DateTime.fromISO(e.event_date) < DateTime.now().minus({ days: 1 })).length ===
        wishlist.events.length
      : false;

  return (
    <Card
      to={`/wishlists/${wishlist.id}`}
      className={clsx(classes.card, past && classes.disabled, 'animated fadeIn fast')}
    >
      <Stack direction="row" justifyContent="space-between" height="100%">
        <div className={classes.wishlist}>
          <Stack direction="row" alignItems="center" justifyContent="center" marginBottom="10px" gap={1}>
            {!wishlist.config.hide_items && <PublicIcon fontSize="small" color="info" />}
            <span className={classes.title}>{wishlist.title}</span>
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center" flexWrap="wrap" gap={1} marginTop="14px">
            {'events' in wishlist && (
              <>
                {wishlist.events.map((event) => (
                  <Chip
                    key={event.id}
                    color="default"
                    size="small"
                    icon={<CalendarMonthIcon />}
                    sx={{ cursor: 'pointer' }}
                    label={event.title}
                  />
                ))}
              </>
            )}
            {'owner' in wishlist && (
              <Chip
                color="default"
                size="small"
                avatar={wishlist.owner.picture_url ? <Avatar src={wishlist.owner.picture_url} /> : <PersonIcon />}
                label={`${wishlist.owner.firstname} ${wishlist.owner.lastname}`}
              />
            )}
          </Stack>
        </div>
        <div className={classes.arrow}>
          <KeyboardArrowRightIcon />
        </div>
      </Stack>
    </Card>
  );
};
