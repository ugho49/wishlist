import type { EventId } from '@wishlist/common';

import CloseIcon from '@mui/icons-material/Close';
import ForestIcon from '@mui/icons-material/Forest';
import { alpha, Button, IconButton, styled } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit';
import { PageHeroRow } from '../common/PageHero';

const FOREST = '#1b5e20';

const Band = styled(PageHeroRow)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gridTemplateAreas: `
    "icon text close"
    "action action action"
  `,
  alignItems: 'center',
  columnGap: theme.spacing(1.5),
  rowGap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: 16,
  color: FOREST,
  background: `linear-gradient(135deg, ${alpha('#81c784', 0.22)} 0%, ${alpha('#f1f8f4', 0.9)} 55%, ${alpha('#ef5350', 0.08)} 100%)`,
  border: `1px solid ${alpha('#66bb6a', 0.35)}`,

  [theme.breakpoints.up('sm')]: {
    gridTemplateAreas: '"icon text action close"',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto auto',
    padding: theme.spacing(1.5, 1.5, 1.5, 2),
  },
}));

const IconTile = styled('div')(({ theme }) => ({
  gridArea: 'icon',
  alignSelf: 'start',
  [theme.breakpoints.up('sm')]: {
    alignSelf: 'center',
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 12,
  color: '#43a047',
  backgroundColor: '#ffffff',
  boxShadow: `0 2px 8px -2px ${alpha('#2e7d32', 0.35)}`,
}));

const Text = styled('div')({
  gridArea: 'text',
  minWidth: 0,
});

const Title = styled('div')({
  fontSize: '0.95rem',
  fontWeight: 700,
  lineHeight: 1.3,
});

const Subtitle = styled('div')({
  fontSize: '0.8125rem',
  lineHeight: 1.4,
  color: alpha(FOREST, 0.8),
});

const ActionButton = styled(Button)({
  gridArea: 'action',
  height: 36,
  borderRadius: 999,
  fontWeight: 600,
  whiteSpace: 'nowrap',
  color: '#ffffff',
  backgroundColor: '#43a047',
  '&:hover': {
    backgroundColor: '#388e3c',
    boxShadow: `0 4px 12px ${alpha('#2e7d32', 0.3)}`,
  },
});

const CloseButton = styled(IconButton)({
  gridArea: 'close',
  alignSelf: 'start',
  color: alpha(FOREST, 0.6),
  '&:hover': {
    color: FOREST,
    backgroundColor: alpha(FOREST, 0.08),
  },
});

interface SecretSantaSuggestionCardProps {
  eventId: EventId;
  onDismiss: () => void;
}

export function SecretSantaSuggestionCard({ eventId, onDismiss }: SecretSantaSuggestionCardProps) {
  const navigate = useNavigate();

  const handleCreateSecretSanta = () => {
    void navigate({ to: '/events/$eventId/edit', params: { eventId }, search: { tab: TabValues.secretSanta } });
  };

  return (
    <Band as="section" aria-label="Suggestion Secret Santa">
      <IconTile>
        <ForestIcon />
      </IconTile>
      <Text>
        <Title>Organisez un Secret Santa !</Title>
        <Subtitle>Tirez au sort qui offre à qui, en fixant un budget max.</Subtitle>
      </Text>
      <ActionButton variant="contained" disableElevation onClick={handleCreateSecretSanta}>
        Créer un Secret Santa
      </ActionButton>
      <CloseButton size="small" onClick={onDismiss} aria-label="Fermer la suggestion">
        <CloseIcon fontSize="small" />
      </CloseButton>
    </Band>
  );
}
