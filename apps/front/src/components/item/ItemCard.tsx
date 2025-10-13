import type { DetailedWishlistDto, ItemDto, MiniUserDto, WishlistId } from '@wishlist/common'
import type { RootState } from '../../core'

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone'
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RedeemIcon from '@mui/icons-material/Redeem'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import TipsAndUpdatesTwoToneIcon from '@mui/icons-material/TipsAndUpdatesTwoTone'
import {
  Avatar,
  alpha,
  Box,
  Button,
  Chip,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Tooltip,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useApi, useToast } from '../../hooks'
import { Card } from '../common/Card'
import { ConfirmMenuItem } from '../common/ConfirmMenuItem'
import { Rating } from '../common/Rating'
import { ItemFormDialog } from './ItemFormDialog'

// Modern card styling with vertical layout
const ItemCardStyled = styled(Card)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  background: 'white',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'scale(1.008)',
  },
  '&.reserved': {
    '& .item-image-container': {
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `${alpha(theme.palette.success.main, 0.1)}`,
        backdropFilter: 'blur(2px)',
        zIndex: 1,
        pointerEvents: 'none',
      },
    },
  },
  '&.reserved-by-me': {
    border: `3px solid ${theme.palette.primary.light}`,
    '& .item-image-container': {
      '&::before': {
        background: `${alpha(theme.palette.primary.main, 0.1)}`,
      },
    },
  },
}))

// Suggested item badge
const SuggestedBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  zIndex: 3, // Higher z-index to stay above reserved indicator
  background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
  color: theme.palette.info.contrastText,
  fontWeight: 600,
  fontSize: '0.7rem',
  height: '24px',
  boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
  '& .MuiChip-icon': {
    color: 'inherit',
    fontSize: '0.8rem',
  },
}))

// Item image container with full width and fade effect
const ItemImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0',
  height: '180px',
  width: '100%',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
}))

// Item image with responsive sizing - properly centered
const ItemImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  cursor: 'pointer',
  opacity: 0.8,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    opacity: 1,
  },
})

// Item image placeholder when no image - beautiful gift icon with gradient background
const ItemImagePlaceholder = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '4rem',
    color: theme.palette.primary.main,
    opacity: 0.7,
  },
}))

// Gradient overlay for image fade effect - fade to black inside the image
const ImageGradientOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '40px',
  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 100%)',
  pointerEvents: 'none',
  zIndex: 1,
})

// Item content container - vertical layout with reduced margins
const ItemContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: '16px',
  gap: '4px',
})

// Item title with modern typography and link styling
const ItemTitle = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1.1rem',
  textAlign: 'center',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  transition: 'all 0.2s ease',
  marginBottom: '4px',
}))

// Clickable title with link styling - always underlined when there's a URL
const ClickableTitle = styled(Link)(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationColor: theme.palette.primary.main,
  textUnderlineOffset: '2px',
  display: 'block',
  width: '100%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.dark,
    textDecorationColor: theme.palette.primary.dark,
  },
}))

// Item description with subtle styling and minimal margins
const ItemDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  textAlign: 'center',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  fontStyle: 'italic',
  margin: '0',
  padding: '0',
}))

// Reserved indicator - positioned at top with badges
const ReservedIndicator = styled(Box)<{ isReservedByMe: boolean }>(({ theme, isReservedByMe }) => ({
  position: 'absolute',
  top: '12px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  width: '150px',
  justifyContent: 'space-between',
  fontSize: '0.9rem',
  color: theme.palette.success.contrastText,
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: '12px',
  background: isReservedByMe
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    : `linear-gradient(167deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
  boxShadow: isReservedByMe
    ? `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
    : `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
}))

const ReservedIndicatorAvatar = styled(Avatar)(() => ({
  height: '30px',
  width: '30px',
  bgcolor: 'white',
  color: 'black',
  border: '1px solid white',
}))

// Action button with modern styling and proper text sizing
const ActionButton = styled(Button)(() => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  padding: '8px 16px',
  height: '36px',
  minWidth: '120px',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
}))

const ReleaseButton = styled(ActionButton)(({ theme }) => ({
  paddingTop: '0',
  paddingBottom: '0',
  height: '20px',
  fontSize: '0.75rem',
  minWidth: 'auto',
  padding: '4px 8px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: theme.palette.primary.contrastText,
  border: 'none',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '0.875rem',
  },
}))

// Reserved button variant
const ReservedButton = styled(ActionButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  color: theme.palette.success.contrastText,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
  },
}))

// Actions container with reduced padding and proper button spacing
const ActionsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
  marginTop: 'auto',
  paddingTop: '8px',
  flexWrap: 'wrap',
})

// Card footer with date and actions
const ItemFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: 'auto',
}))

// Rating bubble - discrete bottom-right of image
const RatingBubble = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  zIndex: 3,
  background: alpha(theme.palette.background.paper, 0.9),
  borderRadius: '12px',
  display: 'flex',
  padding: '4px 8px',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  backdropFilter: 'blur(8px)',
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
}))

// Date container in metadata
const DateContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
})

// Actions menu container - always visible
const ActionsMenuContainer = styled(Box)({
  position: 'absolute',
  top: '12px',
  left: '12px',
  zIndex: 2,
})

export type ItemCardProps = {
  wishlist: {
    id: WishlistId
    ownerId: string
    hideItems: boolean
  }
  item: ItemDto
  onImageClick?: () => void
}

const mapState = (state: RootState) => state.auth.user?.id

export const ItemCard = ({ item, wishlist, onImageClick }: ItemCardProps) => {
  const currentUserId = useSelector(mapState)
  const api = useApi()
  const { addToast } = useToast()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [takenBy, setTakenBy] = useState<MiniUserDto | undefined>(item.taken_by)

  const isTaken = useMemo(() => takenBy !== undefined, [takenBy])
  const isOwner = currentUserId === wishlist.ownerId
  const canReserve = !isOwner || !wishlist.hideItems
  const canEdit = (isOwner || item.is_suggested) && !isTaken
  const isReservedByCurrentUser = takenBy?.id === currentUserId

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
  const closeMenu = () => setAnchorEl(null)

  const { mutateAsync: deleteItem, isPending: deleteItemPending } = useMutation({
    mutationKey: ['item.delete', { id: item.id }],
    mutationFn: () => api.item.delete(item.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Le souhait à bien été supprimé', variant: 'success' })
      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        items: old.items.filter(i => i.id !== item.id),
      }))
    },
  })

  const { mutateAsync: toggleItem, isPending: toggleItemPending } = useMutation({
    mutationKey: ['item.toggle', { id: item.id }],
    mutationFn: () => api.item.toggle(item.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: res => {
      const action = res.taken_by !== undefined ? 'check' : 'uncheck'
      setTakenBy(res.taken_by)

      if (action === 'check') {
        addToast({
          message: (
            <span>
              Vous avez coché : <b>{item.name}</b>
            </span>
          ),
          variant: 'success',
        })
      } else {
        addToast({
          message: (
            <span>
              Le souhait <b>{item.name}</b> est à nouveau disponible
            </span>
          ),
          variant: 'info',
        })
      }
    },
  })

  const queryClient = useQueryClient()
  const loading = useMemo(() => deleteItemPending || toggleItemPending, [deleteItemPending, toggleItemPending])

  // Determine if we should show reserve button
  const shouldShowReserveButton = useMemo(() => {
    if (!canReserve) return false
    // Hide button if item is taken by someone else
    if (isTaken && !isReservedByCurrentUser) return false
    return true
  }, [canReserve, isTaken, isReservedByCurrentUser])

  return (
    <>
      <ItemCardStyled className={clsx(isTaken && 'reserved', isReservedByCurrentUser && 'reserved-by-me')} noPadding>
        {/* Suggested badge - hide when item is reserved */}
        {item.is_suggested && !isTaken && (
          <SuggestedBadge icon={<TipsAndUpdatesTwoToneIcon />} label="Suggéré par un utilisateur" size="small" />
        )}

        {/* Actions menu - always visible */}
        {canEdit && (
          <ActionsMenuContainer>
            <IconButton
              onClick={openMenu}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </ActionsMenuContainer>
        )}

        {/* Reserved indicator - elegant and compact */}
        {isTaken && (
          <ReservedIndicator isReservedByMe={isReservedByCurrentUser}>
            <RedeemIcon sx={{ fontSize: '1rem' }} />
            <span>Réservé</span>
            <Tooltip title={takenBy?.firstname}>
              <ReservedIndicatorAvatar src={takenBy?.picture_url}>
                {takenBy?.firstname?.toUpperCase()?.charAt(0)}
              </ReservedIndicatorAvatar>
            </Tooltip>
          </ReservedIndicator>
        )}

        {/* Item image */}
        <ItemImageContainer className={'item-image-container'}>
          {item.picture_url ? (
            <ItemImage onClick={() => onImageClick?.()} src={item.picture_url} alt={item.name} />
          ) : (
            <ItemImagePlaceholder>
              <CardGiftcardIcon />
            </ItemImagePlaceholder>
          )}
          <ImageGradientOverlay />

          {/* Rating bubble - bottom-right of image */}
          {item.score && item.score > 0 && (
            <RatingBubble>
              <Rating value={item.score} size="small" readOnly />
            </RatingBubble>
          )}
        </ItemImageContainer>

        {/* Item content */}
        <ItemContent
          className={'item-content'}
          sx={{ cursor: item.url ? 'pointer' : 'default' }}
          onClick={() => item.url && window.open(item.url, '_blank', 'noopener,noreferrer')}
        >
          {/* Title */}
          <ItemTitle>
            {item.url ? (
              <ClickableTitle href={item.url} target="_blank" rel="noopener noreferrer">
                {item.name}
              </ClickableTitle>
            ) : (
              item.name
            )}
          </ItemTitle>

          {/* Description */}
          {item.description && <ItemDescription>{item.description}</ItemDescription>}

          {/* Action buttons - pushed to bottom */}
          <ActionsContainer>
            {/* Reserve button - only show Reserve button in content */}
            {shouldShowReserveButton && !isReservedByCurrentUser && (
              <ReservedButton
                onClick={e => {
                  e.stopPropagation()
                  toggleItem()
                }}
                disabled={loading || isTaken}
                startIcon={<RedeemIcon />}
              >
                Réserver
              </ReservedButton>
            )}
          </ActionsContainer>
        </ItemContent>

        {/* Card footer - at the very bottom */}
        <ItemFooter
          className={'item-footer'}
          style={{ justifyContent: shouldShowReserveButton && isReservedByCurrentUser ? 'space-between' : 'center' }}
        >
          <DateContainer>
            <Typography variant="caption">Ajouté {DateTime.fromISO(item.created_at).toRelative()}</Typography>
          </DateContainer>

          {/* Release button in footer when item is reserved by current user */}
          {shouldShowReserveButton && isReservedByCurrentUser && (
            <ReleaseButton
              variant="contained"
              size="small"
              onClick={() => toggleItem()}
              disabled={loading}
              startIcon={<RemoveCircleOutlineIcon />}
            >
              Libérer
            </ReleaseButton>
          )}
        </ItemFooter>
      </ItemCardStyled>

      {/* Actions menu */}
      <Menu id="item-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu()
            setOpenDialog(true)
          }}
        >
          <ListItemIcon>
            <EditTwoToneIcon />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <ConfirmMenuItem
          onClick={() => deleteItem()}
          onCancel={() => closeMenu()}
          confirmTitle="Supprimer le souhait"
          confirmText={
            <span>
              Êtes-vous sûr de vouloir supprimer le souhait <b>{item.name}</b> ?
            </span>
          }
        >
          <ListItemIcon>
            <DeleteForeverTwoToneIcon />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </ConfirmMenuItem>
      </Menu>

      {/* Edit dialog */}
      <ItemFormDialog
        mode="edit"
        title="Modifier le souhait"
        item={item}
        wishlistId={wishlist.id}
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
      />
    </>
  )
}
