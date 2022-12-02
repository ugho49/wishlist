import React from 'react';
import { Rating as MuiRating, ratingClasses, RatingProps as MuiRatingProps, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

export type RatingProps = {
  value: MuiRatingProps['value'];
  disabled?: MuiRatingProps['disabled'];
  onChange?: MuiRatingProps['onChange'];
  size?: MuiRatingProps['size'];
  readOnly?: MuiRatingProps['readOnly'];
};

const useStyles = makeStyles((theme: Theme) => ({
  rating: {
    [`& .${ratingClasses.iconFilled}`]: {
      color: theme.palette.primary.light,
    },
    [`& .${ratingClasses.iconHover}`]: {
      color: theme.palette.primary.main,
    },
  },
}));

export const Rating = ({ value, disabled, onChange, size, readOnly }: RatingProps) => {
  const classes = useStyles();

  return (
    <MuiRating
      className={classes.rating}
      value={value}
      disabled={disabled}
      onChange={onChange}
      size={size}
      readOnly={readOnly}
    />
  );
};
