import type { RatingProps as MuiRatingProps } from '@mui/material'

import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Rating as MuiRating, ratingClasses, styled } from '@mui/material'

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
