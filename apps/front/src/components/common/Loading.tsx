import { Box, CircularProgress, Stack, type StackProps, styled } from '@mui/material';

import { brandColors } from '../../theme';
import { Genie } from './Genie';

const RING_SIZE = 88;

const Spinner = styled(Box)({
  position: 'relative',
  width: RING_SIZE,
  height: RING_SIZE,
  display: 'grid',
  placeItems: 'center',
});

const Track = styled(CircularProgress)({
  position: 'absolute',
  inset: 0,
  color: brandColors.mist,
});

const Arc = styled(CircularProgress)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  color: theme.palette.primary.main,
}));

export type LoadingProps = StackProps & {};

export const Loading = ({ sx, ...props }: LoadingProps) => (
  <Stack
    sx={{ alignItems: 'center', justifyContent: 'center', marginTop: '100px', marginBottom: '100px', ...sx }}
    {...props}
  >
    <Spinner role="progressbar" aria-label="Chargement">
      <Track variant="determinate" value={100} size={RING_SIZE} thickness={2.5} aria-hidden />
      <Arc size={RING_SIZE} thickness={2.5} aria-hidden />
      <Genie size={54} floating />
    </Spinner>
  </Stack>
);
