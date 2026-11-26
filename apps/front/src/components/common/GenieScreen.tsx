import type { ReactNode } from 'react';

import { Box, styled, Typography, useMediaQuery, useTheme } from '@mui/material';

import { brandColors } from '../../theme';
import { Genie, type GenieVariant } from './Genie';

const ScreenRoot = styled('main')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(4, 3),
  textAlign: 'center',
  color: theme.palette.primary.main,
}));

const Eyebrow = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: '3.5rem',
  fontWeight: 700,
  lineHeight: 1,
  color: brandColors.mist,
  WebkitTextStroke: `1.5px ${theme.palette.primary.main}`,
}));

const ScreenTitle = styled('h1')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: '2rem',
  fontWeight: 600,
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.6rem',
  },
}));

const ScreenSubtitle = styled(Typography)(({ theme }) => ({
  maxWidth: 440,
  marginTop: theme.spacing(1),
  fontSize: '1.05rem',
  color: theme.palette.text.secondary,
}));

export type GenieScreenProps = {
  /** Big line above the title, e.g. "404". */
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  genieVariant?: GenieVariant;
};

/** Full-page screen with the genie, for situations outside the normal layouts (404, maintenance). */
export const GenieScreen = ({ eyebrow, title, subtitle, action, genieVariant }: GenieScreenProps) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  return (
    <ScreenRoot>
      <Genie variant={genieVariant} size={isSmallScreen ? 180 : 240} floating grounded />
      <Box>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <ScreenTitle>{title}</ScreenTitle>
        {subtitle ? <ScreenSubtitle>{subtitle}</ScreenSubtitle> : null}
      </Box>
      {action}
    </ScreenRoot>
  );
};
