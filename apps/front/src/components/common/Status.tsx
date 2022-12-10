import React, { PropsWithChildren } from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';

export type StatusProps = {
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  colorGradient?: 'light' | 'main' | 'dark';
  sx?: SxProps<Theme>;
};

const useStyles = makeStyles((theme: Theme) => ({
  bullet: {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    margin: 'auto',
  },
}));

export const Status = ({ color = 'primary', colorGradient = 'light', sx }: PropsWithChildren<StatusProps>) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Stack sx={{ width: '100%', ...sx }}>
      <Box
        className={classes.bullet}
        sx={{
          backgroundColor: theme.palette[color][colorGradient],
        }}
      />
    </Stack>
  );
};
