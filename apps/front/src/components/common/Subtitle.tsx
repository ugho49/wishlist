import React, { PropsWithChildren } from 'react';
import { Typography, useTheme } from '@mui/material';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

export type SubtitleProps = {
  sx?: SxProps<Theme>;
};

export const Subtitle = ({ children, sx = {} }: PropsWithChildren<SubtitleProps>) => {
  const theme = useTheme();

  return (
    <Typography component="h1" variant="h5" sx={{ marginBottom: '20px', color: theme.palette.primary.dark, ...sx }}>
      {children}
    </Typography>
  );
};
