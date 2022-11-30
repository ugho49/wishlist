import React, { useState } from 'react';
import { WishlistWithEventsDto, WishlistWithOwnerDto } from '@wishlist/common-types';
import { makeStyles } from '@mui/styles';
import { Card } from '../common/Card';
import { Chip, Stack, Theme, Tooltip } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import { WishlistEventsDialog } from './WishlistEventsDialog';

export type WishlistCardProps = {
  wishlist: WishlistWithEventsDto | WishlistWithOwnerDto;
};

const useStyles = makeStyles((theme: Theme) => ({
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
    marginBottom: '10px',
    textAlign: 'center',
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
  const [openEventDialog, setOpenEventDialog] = useState(false);

  // TODO: Add opacity and checkmark if all events are pasts

  return (
    <>
      <Card to={`/wishlists/${wishlist.id}`} className="animated fadeIn fast">
        <Stack direction="row" justifyContent="space-between">
          <div className={classes.wishlist}>
            <div className={classes.title}>{wishlist.title}</div>
            <Stack direction="row" justifyContent="center" alignItems="center" flexWrap="wrap" gap={1}>
              {!wishlist.config.hide_items && (
                <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
                  <Chip label="Publique" color="info" size="small" icon={<PublicIcon />} />
                </Tooltip>
              )}
              {'events' in wishlist && (
                <Chip
                  color="default"
                  size="small"
                  icon={<CalendarMonthIcon />}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenEventDialog(true);
                  }}
                  label={`${wishlist.events.length} ${wishlist.events.length > 1 ? 'évènements' : 'évènement'}`}
                />
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
      {'events' in wishlist && (
        <WishlistEventsDialog
          open={openEventDialog}
          handleClose={() => setOpenEventDialog(false)}
          events={wishlist.events}
        />
      )}
    </>
  );
};
