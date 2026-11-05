import type { SecretSantaUserId } from '@wishlist/common';
import type { SecretSantaUserItem } from './secret-santa.types';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { Avatar, alpha, Button, styled } from '@mui/material';

import { ConfirmIconButton } from '../common/ConfirmIconButton';
import { MetaChipButton } from '../common/PageHero';
import { ManageCard, ManageCardHeader, ManageCardSubtitle, ManageCardTitle } from './SecretSantaManageCard';

const AddButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  height: 32,
  padding: theme.spacing(0, 1.5),
  borderRadius: 999,
  fontWeight: 600,
}));

const List = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

const Row = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  minHeight: 60,
  padding: theme.spacing(1, 0),
  '& + &': {
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  },
}));

const Identity = styled('div')({
  flex: 1,
  minWidth: 0,
});

const Name = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const Secondary = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.78rem',
  color: theme.palette.text.secondary,
  '&.pending': {
    color: theme.palette.warning.dark,
  },
}));

const RowActions = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flexShrink: 0,
}));

const ExclusionChip = styled(MetaChipButton)(({ theme }) => ({
  '& > .MuiSvgIcon-root': { color: theme.palette.text.secondary },
  '&.active': {
    borderColor: alpha(theme.palette.warning.main, 0.35),
    backgroundColor: alpha(theme.palette.warning.main, 0.08),
    color: theme.palette.warning.dark,
    '& > .MuiSvgIcon-root': { color: theme.palette.warning.main },
  },
  '& .label': {
    [theme.breakpoints.down('sm')]: { display: 'none' },
  },
  '& .count': {
    [theme.breakpoints.up('sm')]: { display: 'none' },
  },
}));

const ExclusionCount = styled('span')(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.warning.dark,
}));

const Empty = styled('p')(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(3, 1),
  textAlign: 'center',
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const getName = (user: SecretSantaUserItem) =>
  user.attendee.user ? `${user.attendee.user.firstName} ${user.attendee.user.lastName}` : user.attendee.pendingEmail;

const getExclusionLabel = (count: number) => {
  if (count === 0) return 'Exclure';
  return `${count} exclusion${count > 1 ? 's' : ''}`;
};

type SecretSantaParticipantsCardProps = {
  users: SecretSantaUserItem[];
  editable: boolean;
  canAdd: boolean;
  loading: boolean;
  onAdd: () => void;
  onManageExclusions: (id: SecretSantaUserId) => void;
  onRemove: (id: SecretSantaUserId) => void;
};

export const SecretSantaParticipantsCard = ({
  users,
  editable,
  canAdd,
  loading,
  onAdd,
  onManageExclusions,
  onRemove,
}: SecretSantaParticipantsCardProps) => (
  <ManageCard aria-labelledby="secret-santa-participants-title">
    <ManageCardHeader>
      <div>
        <ManageCardTitle id="secret-santa-participants-title">
          Participants <span className="count">{users.length}</span>
        </ManageCardTitle>
        <ManageCardSubtitle>
          Une exclusion empêche un participant de tirer quelqu'un (son conjoint par exemple).
        </ManageCardSubtitle>
      </div>
      {editable && (
        <AddButton
          variant="outlined"
          size="small"
          startIcon={<PersonAddAltIcon />}
          disabled={loading || !canAdd}
          onClick={onAdd}
        >
          Ajouter
        </AddButton>
      )}
    </ManageCardHeader>

    {users.length === 0 ? (
      <Empty>Ajoutez au moins 2 participants parmi les invités de l'évènement.</Empty>
    ) : (
      <List>
        {users.map(user => {
          const name = getName(user);
          const isPending = !user.attendee.user;
          const exclusionsCount = user.exclusions.length;

          return (
            <Row key={user.id}>
              <Avatar src={user.attendee.user?.pictureUrl ?? undefined} alt="" />
              <Identity>
                <Name>{name}</Name>
                {isPending ? (
                  <Secondary className="pending">Invitation en attente</Secondary>
                ) : (
                  <Secondary>{user.attendee.user?.email}</Secondary>
                )}
              </Identity>
              <RowActions>
                {editable && users.length > 1 && (
                  <ExclusionChip
                    type="button"
                    className={exclusionsCount > 0 ? 'active' : undefined}
                    aria-label={`Gérer les exclusions de ${name}`}
                    onClick={() => onManageExclusions(user.id)}
                  >
                    <PersonOffOutlinedIcon />
                    {exclusionsCount > 0 && <span className="count">{exclusionsCount}</span>}
                    <span className="label">{getExclusionLabel(exclusionsCount)}</span>
                  </ExclusionChip>
                )}
                {!editable && exclusionsCount > 0 && (
                  <ExclusionCount>{getExclusionLabel(exclusionsCount)}</ExclusionCount>
                )}
                {editable && (
                  <ConfirmIconButton
                    confirmTitle="Retirer ce participant ?"
                    confirmText={`${name} ne participera plus au Secret Santa.`}
                    confirmButton="Retirer"
                    onClick={() => onRemove(user.id)}
                    disabled={loading}
                    size="small"
                  >
                    <DeleteOutlineIcon />
                  </ConfirmIconButton>
                )}
              </RowActions>
            </Row>
          );
        })}
      </List>
    )}
  </ManageCard>
);
