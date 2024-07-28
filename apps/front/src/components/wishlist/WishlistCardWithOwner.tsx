import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import PersonIcon from '@mui/icons-material/Person'
import PublicIcon from '@mui/icons-material/Public'
import { Avatar, Badge, Stack, Theme } from '@mui/material'
import { grey } from '@mui/material/colors'
import { makeStyles } from '@mui/styles'
import { WishlistWithOwnerDto } from '@wishlist/common-types'
import clsx from 'clsx'
import React from 'react'

import { Card } from '../common/Card'

export type WishlistCardWithOwnerProps = {
  wishlist: WishlistWithOwnerDto
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    height: '100%',
    padding: '6px',
    borderRadius: '30px',
  },
  title: {
    color: theme.palette.primary.main,
    fontWeight: 400,
    overflow: 'hidden',
    maxWidth: '100%',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    marginInline: '16px',
  },
  arrow: {
    color: theme.palette.primary.light,
  },
}))

const logoSize = 60

export const WishlistCardWithOwner = ({ wishlist }: WishlistCardWithOwnerProps) => {
  const classes = useStyles()

  return (
    <Card to={`/wishlists/${wishlist.id}`} className={clsx(classes.card, 'animated fadeIn fast')}>
      <Stack direction="row" justifyContent="space-between" height="100%" alignItems="center">
        <div>
          {wishlist.config.hide_items ? (
            <Avatar
              src={wishlist.owner.picture_url}
              sx={{ width: logoSize, height: logoSize, bgcolor: grey[200], color: grey[400] }}
            >
              <PersonIcon fontSize="medium" />
            </Avatar>
          ) : (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <PublicIcon fontSize="small" color="info" sx={{ background: 'white', borderRadius: '50%' }} />
              }
            >
              <Avatar
                src={wishlist.logo_url}
                sx={{ width: logoSize, height: logoSize, bgcolor: grey[200], color: grey[400] }}
              >
                <PersonIcon fontSize="medium" />
              </Avatar>
            </Badge>
          )}
        </div>
        <span className={classes.title}>{wishlist.title}</span>
        <div className={classes.arrow}>
          <KeyboardArrowRightIcon />
        </div>
      </Stack>
    </Card>
  )
}
