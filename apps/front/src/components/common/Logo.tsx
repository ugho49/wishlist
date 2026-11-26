import type { SxProps, Theme } from '@mui/material';

import { Box, styled } from '@mui/material';

import logoDark from '../../assets/logo/logo-dark.png';
import wordmarkDark from '../../assets/logo/wordmark-dark.png';

const LOGO_ARTWORK = {
  full: logoDark,
  wordmark: wordmarkDark,
} as const;

const LogoImage = styled('img')({
  display: 'block',
  width: 'auto',
  maxWidth: '100%',
  objectFit: 'contain',
});

interface LogoProps {
  /** `full`: genie + lettering, `wordmark`: the "wishlist" lettering alone (navigation bars). */
  variant?: keyof typeof LOGO_ARTWORK;
  /** Height in pixels; the width follows the artwork. */
  height?: number;
  sx?: SxProps<Theme>;
}

/** White version of the logo, for the navy surfaces (navigation, landing, auth pages). */
export const Logo = ({ variant = 'full', height = 48, sx }: LogoProps) => (
  <Box sx={sx}>
    <LogoImage src={LOGO_ARTWORK[variant]} alt="Wishlist" style={{ height }} />
  </Box>
);
