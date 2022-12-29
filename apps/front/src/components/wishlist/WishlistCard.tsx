import React from 'react';
import { WishlistWithEventsDto, WishlistWithOwnerDto } from '@wishlist/common-types';
import { makeStyles } from '@mui/styles';
import { Card } from '../common/Card';
import { Chip, Stack, Theme } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import clsx from 'clsx';

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
}));

export const WishlistCard = ({ wishlist }: WishlistCardProps) => {
  const classes = useStyles();

  // TODO: Add opacity and checkmark if all events are pasts

  return (
    <Card to={`/wishlists/${wishlist.id}`} className={clsx(classes.card, 'animated fadeIn fast')}>
      <Stack direction="row" justifyContent="space-between">
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
                icon={<PersonIcon />}
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
