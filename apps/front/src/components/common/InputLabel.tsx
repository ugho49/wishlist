import React, { PropsWithChildren } from 'react';
import { InputLabel as MuiInputLabel, inputLabelClasses } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export type InputLabelProps = {
  required?: boolean;
  sx?: SxProps<Theme>;
};

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    [`&.${inputLabelClasses.root}`]: {
      color: theme.palette.primary.main,
      fontWeight: '500',
      marginBottom: '8px',
      fontSize: '1rem',
      [`& .${inputLabelClasses.asterisk}`]: {
        color: theme.palette.error.main,
        marginLeft: '2px',
      },
    },
  },
}));

export const InputLabel = ({ required = false, children, sx }: PropsWithChildren<InputLabelProps>) => {
  const classes = useStyles();

  return (
    <MuiInputLabel required={required} sx={sx} className={classes.label}>
      {children}
    </MuiInputLabel>
  );
};
