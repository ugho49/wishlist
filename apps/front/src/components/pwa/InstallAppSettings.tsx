import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { Alert, Button, Stack, styled, Typography } from '@mui/material';
import { useState } from 'react';

import { usePwaInstall } from '../../hooks/usePwaInstall';
import { useToast } from '../../hooks/useToast';
import { dismissInstallPrompt, isIosSafariUserAgent } from '../../pwa/pwa-install';
import { Card } from '../common/Card';
import { Subtitle } from '../common/Subtitle';
import { InstallAppDialog } from './InstallAppDialog';

const SettingsCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const Description = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

export const InstallAppSettings = () => {
  const { addToast } = useToast();
  const { installed, canNativeInstall, ios, promptInstall } = usePwaInstall();
  const [helpOpen, setHelpOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const showSafariHint =
    ios &&
    !isIosSafariUserAgent(window.navigator.userAgent, window.navigator.maxTouchPoints, window.navigator.platform);

  const handleInstall = async () => {
    // The automatic popup is offered once. Choosing install from settings counts too.
    dismissInstallPrompt();

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

  return (
    <SettingsCard>
      <Subtitle sx={{ mb: 1 }}>Application</Subtitle>
      <Description variant="body2">
        Ajoutez Wishlist à l'écran d'accueil de votre téléphone. La proposition automatique n'apparaît qu'une fois.
      </Description>

      {installed ? (
        <Alert severity="success">Wishlist est installée sur cet appareil.</Alert>
      ) : (
        <Stack direction="row">
          <Button
            variant="contained"
            startIcon={<InstallMobileIcon />}
            onClick={() => void handleInstall()}
            loading={installing}
            disabled={installing}
          >
            Installer l'application
          </Button>
        </Stack>
      )}

      <InstallAppDialog
        open={helpOpen}
        mode={ios ? 'ios' : 'manual'}
        showSafariHint={showSafariHint}
        onClose={() => setHelpOpen(false)}
        onInstall={() => setHelpOpen(false)}
      />
    </SettingsCard>
  );
};
