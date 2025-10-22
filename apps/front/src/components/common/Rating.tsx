import type { RatingProps as MuiRatingProps } from '@mui/material'

import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { alpha, Rating as MuiRating, ratingClasses, Stack, styled } from '@mui/material'

export type RatingProps = {
  value: MuiRatingProps['value']
  disabled?: MuiRatingProps['disabled']
  onChange?: MuiRatingProps['onChange']
  size?: MuiRatingProps['size']
  readOnly?: MuiRatingProps['readOnly']
}

const MuiRatingStyled = styled(MuiRating)(({ theme }) => ({
  [`& .${ratingClasses.iconFilled}`]: {
    color: theme.palette.primary.light,
  },
  [`& .${ratingClasses.iconHover}`]: {
    color: theme.palette.primary.main,
  },
}))

export const RatingBubble = styled(Stack)(({ theme }) => ({
  width: 'fit-content',
  justifyContent: 'center',
  alignItems: 'center',
  background: alpha(theme.palette.background.paper, 0.9),
  borderRadius: '12px',
  padding: '4px 8px',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  backdropFilter: 'blur(8px)',
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
}))

export const Rating = ({ value, disabled, onChange, size, readOnly }: RatingProps) => {
  return (
    <MuiRatingStyled
      value={value}
      disabled={disabled}
      onChange={onChange}
      size={size}
      readOnly={readOnly}
      icon={<FavoriteIcon fontSize="inherit" />}
      emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
    />
  )
}
