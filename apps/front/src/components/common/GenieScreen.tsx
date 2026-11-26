import type { ReactNode } from 'react';

import { Box, GlobalStyles, styled, Typography, useMediaQuery, useTheme } from '@mui/material';

import { brandColors, navyBackdrop } from '../../theme';
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
  color: theme.palette.common.white,
  background: navyBackdrop(theme),
}));

const Eyebrow = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: '3.5rem',
  fontWeight: 700,
  lineHeight: 1,
  color: brandColors.mist,
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
  color: brandColors.mistLight,
}));

export type GenieScreenProps = {
  /** Big line above the title, e.g. "404". */
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  genieVariant?: GenieVariant;
};

/** Full-page navy screen with the genie, for situations outside the normal layouts (404, maintenance). */
export const GenieScreen = ({ eyebrow, title, subtitle, action, genieVariant }: GenieScreenProps) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  return (
    <ScreenRoot>
      {/* Navy overscroll and canvas behind the navy page instead of the light app background */}
      <GlobalStyles styles={{ html: { backgroundColor: theme.palette.primary.dark } }} />
      <Genie variant={genieVariant} size={isSmallScreen ? 180 : 240} floating onDark />
      <Box>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <ScreenTitle>{title}</ScreenTitle>
        {subtitle ? <ScreenSubtitle>{subtitle}</ScreenSubtitle> : null}
      </Box>
      {action}
    </ScreenRoot>
  );
};
