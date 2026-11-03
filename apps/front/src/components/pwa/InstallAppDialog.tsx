import { Alert, Button, Dialog, DialogActions, DialogContent, Stack, styled, Typography } from '@mui/material';

export type InstallAppDialogMode = 'native' | 'ios' | 'manual';

type InstallAppDialogProps = {
  open: boolean;
  mode: InstallAppDialogMode;
  showSafariHint?: boolean;
  installing?: boolean;
  onClose: () => void;
  onInstall: () => void;
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

const AppIcon = styled('img')(({ theme }) => ({
  width: 72,
  height: 72,
  borderRadius: theme.spacing(2),
}));

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

const ActionRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  width: '100%',
}));

const IOS_STEPS = [
  'Appuyez sur le bouton Partager (le carré avec une flèche).',
  "Choisissez « Sur l'écran d'accueil ».",
  'Confirmez avec « Ajouter ».',
];

const MANUAL_STEPS = [
  'Ouvrez le menu du navigateur.',
  "Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
  "Confirmez l'installation.",
];

function stepsFor(mode: InstallAppDialogMode): readonly string[] {
  if (mode === 'ios') {
    return IOS_STEPS;
  }

  if (mode === 'manual') {
    return MANUAL_STEPS;
  }

  return [];
}

const COPY = {
  native: {
    title: 'Installer Wishlist',
    description:
      "Ajoutez l'application à votre écran d'accueil pour ouvrir vos listes en un geste, sans passer par le navigateur.",
  },
  ios: {
    title: 'Installer Wishlist',
    description: "Sur iPhone, ajoutez Wishlist à l'écran d'accueil depuis le menu de partage.",
  },
  manual: {
    title: 'Installer Wishlist',
    description: 'Votre navigateur peut installer Wishlist depuis son menu.',
  },
} as const;

export const InstallAppDialog = ({
  open,
  mode,
  showSafariHint = false,
  installing = false,
  onClose,
  onInstall,
}: InstallAppDialogProps) => {
  const copy = COPY[mode];
  const steps = stepsFor(mode);
  const handleClose = () => {
    if (!installing) {
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="xs" fullWidth aria-labelledby="install-app-title">
      <DialogContent>
        <Header>
          <AppIcon src="/icon_192x192.png" alt="" />
          <Title id="install-app-title" variant="h5">
            {copy.title}
          </Title>
        </Header>
        <Description variant="body1">{copy.description}</Description>
        {steps.length > 0 ? (
          <Steps>
            {steps.map(step => (
              <Step key={step}>{step}</Step>
            ))}
          </Steps>
        ) : null}
        {showSafariHint ? (
          <SafariHint severity="info">
            Ouvrez wishlistapp.fr dans Safari pour ajouter l'icône à l'écran d'accueil.
          </SafariHint>
        ) : null}
      </DialogContent>
      <DialogActions>
        <ActionRow>
          {mode === 'native' && (
            <Button variant="outlined" onClick={onClose} disabled={installing}>
              Plus tard
            </Button>
          )}
          <Button
            variant="contained"
            onClick={mode === 'native' ? onInstall : onClose}
            loading={installing}
            disabled={installing}
          >
            {mode === 'native' ? 'Installer' : "J'ai compris"}
          </Button>
        </ActionRow>
      </DialogActions>
    </StyledDialog>
  );
};
