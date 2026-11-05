import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EuroIcon from '@mui/icons-material/Euro';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import { alpha, Button, styled, Tooltip } from '@mui/material';

import { wholeEurosFormatter } from '../../utils/currency.utils';
import { Description } from '../common/Description';
import { ManageCard, ManageCardHeader, ManageCardSubtitle, ManageCardTitle } from './SecretSantaManageCard';

const Settings = styled('dl')(({ theme }) => ({
  margin: 0,
  display: 'grid',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'minmax(180px, 220px) minmax(0, 1fr)',
  },
}));

const Setting = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  minWidth: 0,
  padding: theme.spacing(1.5),
  borderRadius: 14,
  backgroundColor: alpha(theme.palette.primary.main, 0.035),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.06)}`,
}));

const SettingIcon = styled('div')(({ theme }) => ({
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.success.main,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 0 0 1px ${alpha(theme.palette.success.main, 0.15)}`,
  '& > .MuiSvgIcon-root': { fontSize: 18 },
}));

const SettingBody = styled('div')({
  minWidth: 0,
  flex: 1,
});

const SettingLabel = styled('dt')(({ theme }) => ({
  fontSize: '0.72rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const SettingValue = styled('dd')(({ theme }) => ({
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  '&.empty': {
    fontWeight: 400,
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  '&.note': {
    fontWeight: 400,
    fontSize: '0.875rem',
  },
}));

const EditButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  height: 32,
  padding: theme.spacing(0, 1.5),
  borderRadius: 999,
  fontWeight: 600,
}));

type SecretSantaSettingsCardProps = {
  budget?: number | null;
  description?: string | null;
  editable: boolean;
  loading: boolean;
  onEdit: () => void;
};

export const SecretSantaSettingsCard = ({
  budget,
  description,
  editable,
  loading,
  onEdit,
}: SecretSantaSettingsCardProps) => (
  <ManageCard aria-labelledby="secret-santa-settings-title">
    <ManageCardHeader>
      <div>
        <ManageCardTitle id="secret-santa-settings-title">Réglages</ManageCardTitle>
        <ManageCardSubtitle>Visibles par tous les participants, sur la page de l'évènement.</ManageCardSubtitle>
      </div>
      <Tooltip title={editable ? '' : 'Annulez le tirage pour modifier les réglages'}>
        <span>
          <EditButton
            variant="outlined"
            size="small"
            startIcon={<EditOutlinedIcon />}
            disabled={!editable || loading}
            onClick={onEdit}
          >
            Modifier
          </EditButton>
        </span>
      </Tooltip>
    </ManageCardHeader>

    <Settings>
      <Setting>
        <SettingIcon>
          <EuroIcon />
        </SettingIcon>
        <SettingBody>
          <SettingLabel>Budget max par cadeau</SettingLabel>
          <SettingValue className={budget ? undefined : 'empty'}>
            {budget ? wholeEurosFormatter.format(budget) : 'Libre'}
          </SettingValue>
        </SettingBody>
      </Setting>
      <Setting>
        <SettingIcon>
          <RateReviewOutlinedIcon />
        </SettingIcon>
        <SettingBody>
          <SettingLabel>Le mot de l'organisateur</SettingLabel>
          {description ? (
            <SettingValue className="note">
              <Description text={description} variant="plain" collapsedHeight={72} />
            </SettingValue>
          ) : (
            <SettingValue className="empty">Aucun message pour l'instant</SettingValue>
          )}
        </SettingBody>
      </Setting>
    </Settings>
  </ManageCard>
);
