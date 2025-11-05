import type { WishlistWithOwnerDto } from '@wishlist/common'

import PublicIcon from '@mui/icons-material/Public'
import { styled, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import clsx from 'clsx'

import { getAvatarUrl } from '../../utils/wishlist.utils'
import { Card } from '../common/Card'
import { WishlistAvatar } from './WishlistAvatar'

export type WishlistCardWithOwnerProps = {
  wishlist: WishlistWithOwnerDto
}

const WishlistCardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: '5.5rem',
  padding: 12,
  gap: '16px',
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    '& .wishlist-avatar': {
      transform: 'scale(1.05)',
      boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
    },
  },
}))

const AvatarContainer = styled('div')({
  position: 'relative',
  zIndex: 1,
})

const ContentContainer = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minWidth: 0,
  zIndex: 1,
  gap: '4px',
})

const WishlistTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 500,
  fontSize: '1rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
}))

const OwnerInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}))

const PublicBadge = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px solid ${theme.palette.background.paper}`,
  zIndex: 2,
}))

const PublicIconStyled = styled(PublicIcon)(() => ({
  fontSize: '12px',
  color: 'white',
}))

export const WishlistCardWithOwner = ({ wishlist }: WishlistCardWithOwnerProps) => {
  const navigate = useNavigate()
  const isPublic = !wishlist.config.hide_items

  return (
    <WishlistCardContent
      onClick={() => navigate({ to: '/wishlists/$wishlistId', params: { wishlistId: wishlist.id } })}
      className={clsx('animated fadeIn fast')}
      hoverable
    >
      <AvatarContainer>
        <WishlistAvatar
          src={getAvatarUrl({ wishlist, ownerPictureUrl: wishlist.owner.picture_url })}
          className="wishlist-avatar"
        />
        {isPublic && (
          <PublicBadge>
            <PublicIconStyled />
          </PublicBadge>
        )}
      </AvatarContainer>

      <ContentContainer>
        <WishlistTitle className="wishlist-title">{wishlist.title}</WishlistTitle>
        <OwnerInfo className="owner-info">
          {wishlist.owner.firstname} {wishlist.owner.lastname}
        </OwnerInfo>
      </ContentContainer>
    </WishlistCardContent>
  )
}
