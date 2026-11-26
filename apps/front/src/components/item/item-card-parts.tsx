import { AvatarGroup, alpha, Box, Button, Chip, Link, styled, Typography } from '@mui/material';

import { Card } from '../common/Card';
import { RatingBubble } from '../common/Rating';

/**
 * Presentational pieces of the wish card, shared by ItemCard and the landing page mockups
 * so both always look the same.
 */

// Modern card styling with vertical layout
export const ItemCardStyled = styled(Card)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  padding: 0,
  '&:hover': {
    transform: 'scale(1.008)',
  },
  '&.reserved': {
    border: `3px solid ${theme.palette.success.main}`,
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
}));

// Suggested item badge
export const SuggestedBadge = styled(Chip)(({ theme }) => ({
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
}));

// Item image container with full width and fade effect
export const ItemImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0',
  height: '240px',
  width: '100%',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
}));

// Item image with responsive sizing - properly centered
export const ItemImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  cursor: 'pointer',
  opacity: 1,
  transition: 'all 0.2s ease',
});

export const RatingBubbleStyled = styled(RatingBubble)(() => ({
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  zIndex: 3,
}));

// Item image placeholder when no image - beautiful gift icon with gradient background
export const ItemImagePlaceholder = styled(Box)(({ theme }) => ({
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
}));

// Gradient overlay for image fade effect - fade to black inside the image
export const ImageGradientOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '40px',
  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 100%)',
  pointerEvents: 'none',
  zIndex: 1,
});

// Item content container - vertical layout with reduced margins
export const ItemContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: '16px',
  gap: '4px',
});

// Item title with modern typography and link styling
export const ItemTitle = styled('div')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '1.15rem',
  textAlign: 'center',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  transition: 'all 0.2s ease',
  marginBottom: '4px',
}));

// Clickable title with link styling - always underlined when there's a URL
export const ClickableTitle = styled(Link)(({ theme }) => ({
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
}));

// Item description with subtle styling and minimal margins
export const ItemDescription = styled(Typography)(({ theme }) => ({
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
}));

// Reserved indicator - positioned at top with badges
export const ReservedIndicator = styled(Box, { shouldForwardProp: prop => prop !== 'isReservedByMe' })<{
  isReservedByMe: boolean;
}>(({ theme, isReservedByMe }) => ({
  position: 'absolute',
  top: '12px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: 'max-content',
  maxWidth: 'calc(100% - 72px)',
  justifyContent: 'center',
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
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'filter 0.15s ease',
  '&:hover': {
    filter: 'brightness(1.1)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.common.white}`,
    outlineOffset: 2,
  },
}));

export const ReservedAvatarGroup = styled(AvatarGroup)(() => ({
  '& .MuiAvatar-root': {
    height: '28px',
    width: '28px',
    fontSize: '0.75rem',
    border: '1px solid white',
    backgroundColor: 'white',
    color: 'black',
  },
}));

// Action button with modern styling and proper text sizing
export const ActionButton = styled(Button)(() => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  padding: '8px 16px',
  height: '36px',
  minWidth: '120px',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
}));

export const ReleaseButton = styled(ActionButton)(({ theme }) => ({
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
}));

// Reserved button variant
export const ReservedButton = styled(ActionButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  color: theme.palette.success.contrastText,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
  },
}));

// Actions container with reduced padding and proper button spacing
export const ActionsContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
  marginTop: 'auto',
  paddingTop: '8px',
  flexWrap: 'wrap',
});

// Card footer with date and actions
export const ItemFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: 'auto',
}));

// Date container in metadata
export const DateContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

// Actions menu container - always visible
export const ActionsMenuContainer = styled(Box)({
  position: 'absolute',
  top: '12px',
  left: '12px',
  zIndex: 2,
});
