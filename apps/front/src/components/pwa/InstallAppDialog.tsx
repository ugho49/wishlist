import { Alert, Button, Dialog, DialogActions, DialogContent, Stack, styled, Typography } from '@mui/material';

export type InstallAppDialogMode = 'ios' | 'manual';

type InstallAppDialogProps = {
  open: boolean;
  mode: InstallAppDialogMode;
  showSafariHint?: boolean;
  onClose: () => void;
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1),
    maxWidth: 420,
    width: 'calc(100% - 32px)',
  },
}));

const Header = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
}));

const AppIcon = styled('img')({
  width: 72,
  height: 72,
});

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '1.35rem',
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.text.primary,
}));

const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}));

const Steps = styled('ol')(({ theme }) => ({
  margin: theme.spacing(2, 0, 0),
  paddingLeft: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const Step = styled('li')(({ theme }) => ({
  lineHeight: 1.5,
  color: theme.palette.text.primary,
}));

const SafariHint = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const COPY = {
  ios: {
    description: "Sur iPhone, ajoutez Wishlist à l'écran d'accueil depuis le menu de partage.",
    steps: [
      'Appuyez sur le bouton Partager (le carré avec une flèche).',
      "Choisissez « Sur l'écran d'accueil ».",
      'Confirmez avec « Ajouter ».',
    ],
  },
  manual: {
    description: 'Votre navigateur peut installer Wishlist depuis son menu.',
    steps: [
      'Ouvrez le menu du navigateur.',
      "Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
      "Confirmez l'installation.",
    ],
  },
} as const;

export const InstallAppDialog = ({ open, mode, showSafariHint = false, onClose }: InstallAppDialogProps) => {
  const copy = COPY[mode];

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="install-app-title">
      <DialogContent>
        <Header>
          <AppIcon src="/icon_192x192.png" alt="" />
          <Title id="install-app-title" variant="h5">
            Installer Wishlist
          </Title>
        </Header>
        <Description variant="body1">{copy.description}</Description>
        <Steps>
          {copy.steps.map(step => (
            <Step key={step}>{step}</Step>
          ))}
        </Steps>
        {showSafariHint ? (
          <SafariHint severity="info">
            Ouvrez wishlistapp.fr dans Safari pour ajouter l'icône à l'écran d'accueil.
          </SafariHint>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          J'ai compris
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};
