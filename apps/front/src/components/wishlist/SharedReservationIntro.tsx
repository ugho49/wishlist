import CloseIcon from '@mui/icons-material/Close';
import RedeemIcon from '@mui/icons-material/Redeem';
import { alpha, Box, IconButton, Stack, styled, Typography } from '@mui/material';
import { useState } from 'react';

import { NewFeatureBadge } from '../event/NewFeatureBadge';

const DISMISS_KEY = 'wl_shared_reservation_intro_dismissed';

const Banner = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 16,
  padding: theme.spacing(2.5),
  paddingRight: theme.spacing(6),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const IconWrap = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.16)}`,
}));

const Title = styled(Typography)({
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.3,
});

const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  lineHeight: 1.5,
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
};

const persistDismissed = () => {
  try {
    localStorage.setItem(DISMISS_KEY, 'true');
  } catch {
    // Ignore if localStorage is unavailable
  }
};

export const SharedReservationIntro = () => {
  const [visible, setVisible] = useState(() => !readDismissed());

  if (!visible) {
    return null;
  }

  return (
    <Banner>
      <CloseButton
        aria-label="Fermer"
        onClick={() => {
          persistDismissed();
          setVisible(false);
        }}
      >
        <CloseIcon fontSize="small" />
      </CloseButton>

      <Stack gap={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack direction="row" alignItems="center" gap={1.5} minWidth={0}>
            <IconWrap>
              <RedeemIcon fontSize="small" />
            </IconWrap>
            <Title>Plusieurs personnes peuvent réserver un cadeau</Title>
          </Stack>
          <NewFeatureBadge />
        </Stack>

        <Description>
          Un souhait n’est plus limité à une seule personne. Par exemple, si Marie réserve un vélo, Paul et Léa peuvent
          aussi cliquer sur « Participer » pour s’y joindre — pratique pour un cadeau à plusieurs. Le badge Réservé
          affiche qui s’est inscrit.
        </Description>
      </Stack>
    </Banner>
  );
};
