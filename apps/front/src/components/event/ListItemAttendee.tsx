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

/** Text and role chip side by side; on phones the chip drops under the email so it never covers it. */
const AttendeeBody = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(0.5),
  },
}));

const AttendeeText = styled(ListItemText)(({ theme }) => ({
  flex: '1 1 auto',
  minWidth: 0,
  marginTop: 0,
  marginBottom: 0,
  [theme.breakpoints.down('sm')]: {
    // Full width in the column layout, so long names and emails get the ellipsis.
    alignSelf: 'stretch',
  },
}));

const UserName = styled('b')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
  display: 'block',
});

const RoleChipSlot = styled('div')({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
});

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
      <AttendeeBody>
        <AttendeeText
          slotProps={{
            primary: { component: 'div' },
            secondary: { component: 'div', noWrap: !isPending },
          }}
          primary={<UserName>{isPending ? email : userName}</UserName>}
          secondary={isPending ? 'Invitation en attente de validation' : email}
        />
        <RoleChipSlot>
          <AttendeeRoleChip role={role} editable={roleEditable} disabled={roleDisabled} onRoleChange={onRoleChange} />
        </RoleChipSlot>
      </AttendeeBody>
    </>
  );
};
