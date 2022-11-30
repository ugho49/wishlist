import React from 'react';
import { Box, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { BreaklineText } from './BreaklineText';

const useStyles = makeStyles((theme: Theme) => ({
  description: {
    textAlign: 'center',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    color: theme.palette.text.secondary,
    border: `2px solid ${theme.palette.secondary.main}`,
    backgroundColor: 'rgb(255 210 28 / 5%)',
  },
}));

export const Description = ({ text }: { text: string }) => {
  const classes = useStyles();

  return (
    <Box className={classes.description}>
      <BreaklineText text={text} />
    </Box>
  );
};
