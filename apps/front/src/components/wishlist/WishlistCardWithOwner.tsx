import React from 'react';
import { WishlistWithOwnerDto } from '@wishlist/common-types';
import { makeStyles } from '@mui/styles';
import { Card } from '../common/Card';
import { Avatar, Chip, Stack, Theme } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import clsx from 'clsx';

export type WishlistCardWithOwnerProps = {
  wishlist: WishlistWithOwnerDto;
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

export const WishlistCardWithOwner = ({ wishlist }: WishlistCardWithOwnerProps) => {
  const classes = useStyles();

  return (
    <Card to={`/wishlists/${wishlist.id}`} className={clsx(classes.card, 'animated fadeIn fast')}>
      <Stack direction="row" justifyContent="space-between" height="100%">
        <div className={classes.wishlist}>
          <Stack direction="row" alignItems="center" justifyContent="center" marginBottom="10px" gap={1}>
            {!wishlist.config.hide_items && <PublicIcon fontSize="small" color="info" />}
            <span className={classes.title}>{wishlist.title}</span>
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems="center" flexWrap="wrap" gap={1} marginTop="14px">
            <Chip
              color="default"
              size="small"
              avatar={wishlist.owner.picture_url ? <Avatar src={wishlist.owner.picture_url} /> : <PersonIcon />}
              label={`${wishlist.owner.firstname} ${wishlist.owner.lastname}`}
            />
          </Stack>
        </div>
        <div className={classes.arrow}>
          <KeyboardArrowRightIcon />
        </div>
      </Stack>
    </Card>
  );
};
