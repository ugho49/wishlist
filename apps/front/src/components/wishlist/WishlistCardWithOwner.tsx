import type { WishlistWithOwnerDto } from '@wishlist/common-types'

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import PersonIcon from '@mui/icons-material/Person'
import PublicIcon from '@mui/icons-material/Public'
import { Avatar, Badge, Stack, styled } from '@mui/material'
import { grey } from '@mui/material/colors'

import { Card } from '../common/Card'

export type WishlistCardWithOwnerProps = {
  wishlist: WishlistWithOwnerDto
}

const logoSize = 60

const CardStyled = styled(Card)({
  height: '100%',
  padding: '6px !important',
  borderRadius: '30px',
})

const Title = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 400,
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  marginInline: '16px',
}))

const Arrow = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.palette.primary.light,
}))

export const WishlistCardWithOwner = ({ wishlist }: WishlistCardWithOwnerProps) => {
  return (
    <CardStyled to={`/wishlists/${wishlist.id}`} className="animated fadeIn fast">
      <Stack direction="row" justifyContent="space-between" height="100%" alignItems="center">
        <div>
          {wishlist.config.hide_items ? (
            <Avatar
              src={wishlist.logo_url ?? wishlist.owner.picture_url}
              sx={{ width: logoSize, height: logoSize, bgcolor: grey[200], color: grey[400] }}
            >
              <PersonIcon fontSize="medium" />
            </Avatar>
          ) : (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <PublicIcon fontSize="small" color="primary" sx={{ background: 'white', borderRadius: '50%' }} />
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
        <Title>{wishlist.title}</Title>
        <Arrow>
          <KeyboardArrowRightIcon />
        </Arrow>
      </Stack>
    </CardStyled>
  )
}
