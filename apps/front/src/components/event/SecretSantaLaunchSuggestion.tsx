import type { EventId } from '@wishlist/common';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useNavigate } from '@tanstack/react-router';

import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit';
import { SecretSantaRow, SecretSantaRowActions, SecretSantaRowButton, SecretSantaRowLead } from './SecretSantaHeroRow';

const participantsLabel = (count: number) => {
  if (count === 0) return "Aucun participant pour l'instant : ajoutez-les puis lancez le tirage.";
  return `${count} participant${count > 1 ? 's' : ''} pour l'instant : vérifiez la liste puis lancez le tirage.`;
};

type SecretSantaLaunchSuggestionProps = {
  eventId: EventId;
  participantsCount: number;
};

export const SecretSantaLaunchSuggestion = ({ eventId, participantsCount }: SecretSantaLaunchSuggestionProps) => {
  const navigate = useNavigate();

  return (
    <SecretSantaRow as="section" aria-label="Lancer le Secret Santa">
      <SecretSantaRowLead
        visual={<InfoOutlinedIcon />}
        withGiftBadge={false}
        eyebrow="Secret Santa · à lancer"
        title="Lancez le tirage au sort !"
        subtitle={participantsLabel(participantsCount)}
      />
      <SecretSantaRowActions className="cta">
        <SecretSantaRowButton
          type="button"
          onClick={() =>
            navigate({ to: '/events/$eventId/edit', params: { eventId }, search: { tab: TabValues.secretSanta } })
          }
        >
          <SettingsOutlinedIcon />
          Gérer mon Secret Santa
        </SecretSantaRowButton>
      </SecretSantaRowActions>
    </SecretSantaRow>
  );
};
