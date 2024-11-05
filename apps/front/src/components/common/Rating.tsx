import type { RatingProps as MuiRatingProps, Theme } from '@mui/material'

import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Rating as MuiRating, ratingClasses } from '@mui/material'
import { makeStyles } from '@mui/styles'
import React from 'react'

export type RatingProps = {
  value: MuiRatingProps['value']
  disabled?: MuiRatingProps['disabled']
  onChange?: MuiRatingProps['onChange']
  size?: MuiRatingProps['size']
  readOnly?: MuiRatingProps['readOnly']
}

const useStyles = makeStyles((theme: Theme) => ({
  rating: {
    [`& .${ratingClasses.iconFilled}`]: {
      color: theme.palette.primary.light,
    },
    [`& .${ratingClasses.iconHover}`]: {
      color: theme.palette.primary.main,
    },
  },
}))

export const Rating = ({ value, disabled, onChange, size, readOnly }: RatingProps) => {
  const classes = useStyles()

  return (
    <MuiRating
      className={classes.rating}
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
