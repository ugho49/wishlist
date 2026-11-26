import type { SxProps, Theme } from '@mui/material';

import { Box, styled } from '@mui/material';

import logoDark from '../../assets/logo/logo-dark.png';

const LogoImage = styled('img')({
  display: 'block',
  width: 'auto',
  maxWidth: '100%',
  objectFit: 'contain',
});

interface LogoProps {
  /** Height in pixels; the width follows the artwork. */
  height?: number;
  sx?: SxProps<Theme>;
}

/** Genie + "wishlist" lettering in white, for the navy surfaces (navigation, landing, auth pages). */
export const Logo = ({ height = 48, sx }: LogoProps) => (
  <Box sx={sx}>
    <LogoImage src={logoDark} alt="Wishlist" style={{ height }} />
  </Box>
);
