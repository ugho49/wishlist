import type { AttendeeRole } from '../../gql';

import PersonIcon from '@mui/icons-material/Person';
import { Avatar, ListItem, ListItemAvatar, ListItemText, styled } from '@mui/material';
import { blue, orange } from '@mui/material/colors';

import { AttendeeRoleChip } from './AttendeeRoleChip';

type ListItemAttendeeProps = {
  userName: string;
  role: AttendeeRole;
  email: string;
  pictureUrl?: string;
  isPending: boolean;
  roleEditable?: boolean;
  roleDisabled?: boolean;
  onRoleChange?: (role: AttendeeRole) => void;
};

export const AttendeeListItem = styled(ListItem)(({ theme }) => ({
  alignItems: 'center',
  paddingRight: theme.spacing(7),
  [theme.breakpoints.down('sm')]: {
    paddingLeft: 0,
    paddingRight: theme.spacing(6),
  },
  '.MuiListItemSecondaryAction-root': {
    right: theme.spacing(0.5),
  },
}));

const AttendeeText = styled(ListItemText)({
  minWidth: 0,
  marginTop: 0,
  marginBottom: 0,
});

const UserName = styled('b')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
  display: 'block',
});

const RoleChipSlot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  marginLeft: theme.spacing(1),
}));

export const ListItemAttendee = (params: ListItemAttendeeProps) => {
  const { userName, email, isPending, pictureUrl, role, roleEditable, roleDisabled, onRoleChange } = params;
  return (
    <>
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: isPending ? orange[100] : blue[100],
            color: isPending ? orange[600] : blue[600],
          }}
          src={pictureUrl}
        >
          <PersonIcon />
        </Avatar>
      </ListItemAvatar>
      <AttendeeText
        primaryTypographyProps={{ component: 'div' }}
        secondaryTypographyProps={{ component: 'span' }}
        primary={<UserName>{isPending ? email : userName}</UserName>}
        secondary={isPending ? 'Invitation en attente de validation' : email}
      />
      <RoleChipSlot>
        <AttendeeRoleChip role={role} editable={roleEditable} disabled={roleDisabled} onRoleChange={onRoleChange} />
      </RoleChipSlot>
    </>
  );
};
