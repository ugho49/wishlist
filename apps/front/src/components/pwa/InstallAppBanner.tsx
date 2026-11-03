import { alpha, Box, Button, styled, Typography } from '@mui/material';
import { useState } from 'react';

import { usePwaInstall } from '../../hooks/usePwaInstall';
import { useToast } from '../../hooks/useToast';
import { isIosSafariUserAgent } from '../../pwa/pwa-install';
import { InstallAppDialog } from './InstallAppDialog';

const Banner = styled('section')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.25, 1.5),
  borderRadius: 14,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.14)} 100%)`,
}));

const AppIcon = styled('img')(({ theme }) => ({
  flexShrink: 0,
  width: 40,
  height: 40,
  padding: 6,
  borderRadius: 10,
  backgroundColor: theme.palette.common.white,
  boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.15)}`,
}));

const Texts = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.text.primary,
}));

const Caption = styled(Typography)(({ theme }) => ({
  display: 'block',
  lineHeight: 1.3,
  color: theme.palette.text.secondary,
}));

const InstallButton = styled(Button)({
  flexShrink: 0,
  borderRadius: 999,
});

export const InstallAppBanner = () => {
  const { addToast } = useToast();
  const { canOfferInstall, canNativeInstall, ios, promptInstall } = usePwaInstall();
  const [helpOpen, setHelpOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!canOfferInstall) {
    return null;
  }

  const showSafariHint =
    ios &&
    !isIosSafariUserAgent(window.navigator.userAgent, window.navigator.maxTouchPoints, window.navigator.platform);

  const handleInstall = async () => {
    if (!canNativeInstall) {
      setHelpOpen(true);
      return;
    }

    setInstalling(true);

    try {
      const outcome = await promptInstall();

      if (outcome === 'accepted') {
        addToast({ message: "Wishlist va s'installer sur cet appareil", variant: 'success' });
        return;
      }

      if (outcome === 'unavailable') {
        setHelpOpen(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleInstallClick = () => {
    void handleInstall();
  };

  const handleHelpClose = () => setHelpOpen(false);

  return (
    <Banner aria-label="Installer l'application">
      <AppIcon src="/icon_192x192.png" alt="" />
      <Texts>
        <Title variant="body2">Installer l'application</Title>
        <Caption variant="caption">Retrouvez vos listes depuis l'écran d'accueil</Caption>
      </Texts>
      <InstallButton
        variant="contained"
        size="small"
        disableElevation
        onClick={handleInstallClick}
        loading={installing}
      >
        Installer
      </InstallButton>

      <InstallAppDialog
        open={helpOpen}
        mode={ios ? 'ios' : 'manual'}
        showSafariHint={showSafariHint}
        onClose={handleHelpClose}
      />
    </Banner>
  );
};
