import type { WishlistWithOwnerDto } from '@wishlist/common'

import PersonIcon from '@mui/icons-material/Person'
import PublicIcon from '@mui/icons-material/Public'
import { Avatar, styled, Typography } from '@mui/material'
import clsx from 'clsx'

import { Card } from '../common/Card'

export type WishlistCardWithOwnerProps = {
  wishlist: WishlistWithOwnerDto
}

const WishlistCardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  flexDirection: 'row',
  alignItems: 'center',
  height: '5.5rem',
  padding: '12px',
  background: theme.palette.background.paper,
  border: '2px solid transparent',
  borderRadius: '20px',
  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.320, 1)',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 20px 40px ${theme.palette.primary.main}20`,
    borderColor: theme.palette.primary.main,
    '& .wishlist-avatar': {
      transform: 'scale(1.05) rotate(3deg)',
      boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
    },
  },
}))

const AvatarContainer = styled('div')({
  position: 'relative',
  zIndex: 1,
})

const WishlistAvatar = styled(Avatar)(({ theme }) => ({
  width: '65px',
  height: '65px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  fontSize: '1.4rem',
  fontWeight: 'bold',
  border: `3px solid ${theme.palette.background.paper}`,
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
  boxShadow: `0 4px 15px ${theme.palette.primary.main}25`,
}))

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
  const isPublic = !wishlist.config.hide_items
  const initials =
    `${wishlist.owner.firstname?.charAt(0) || ''}${wishlist.owner.lastname?.charAt(0) || ''}`.toUpperCase()

  return (
    <WishlistCardContent
      to={`/wishlists/${wishlist.id}`}
      className={clsx('animated fadeIn fast')}
      biggerPaddingInDesktop={false}
    >
      <AvatarContainer>
        <WishlistAvatar src={wishlist.logo_url ?? wishlist.owner.picture_url} className="wishlist-avatar">
          {!wishlist.logo_url && !wishlist.owner.picture_url ? initials : <PersonIcon fontSize="medium" />}
        </WishlistAvatar>
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
