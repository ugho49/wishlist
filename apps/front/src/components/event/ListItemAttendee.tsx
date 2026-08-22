import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined'
import PersonIcon from '@mui/icons-material/Person'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import { Avatar, ListItem, ListItemAvatar, ListItemText, Stack, styled, Tooltip } from '@mui/material'
import { blue, orange } from '@mui/material/colors'
import { match } from 'ts-pattern'

import { AttendeeRole } from '../../gql'
import { AttendeeRoleChip } from './AttendeeRoleChip'

type ListItemAttendeeProps = {
  userName: string
  role: AttendeeRole
  email: string
  pictureUrl?: string
  isPending: boolean
  roleEditable?: boolean
  roleDisabled?: boolean
  onRoleChange?: (role: AttendeeRole) => void
}

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
}))

const AttendeeText = styled(ListItemText)({
  minWidth: 0,
  marginTop: 0,
  marginBottom: 0,
})

const NameRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
}))

const UserName = styled('b')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
})

const RoleChipSlot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  marginLeft: theme.spacing(1),
}))

const RoleBadge = ({ role }: { role: AttendeeRole }) =>
  match(role)
    .with(AttendeeRole.Creator, () => (
      <Tooltip title="Créateur">
        <WorkspacePremiumOutlinedIcon fontSize="small" />
      </Tooltip>
    ))
    .with(AttendeeRole.Admin, () => (
      <Tooltip title="Admin">
        <LocalPoliceOutlinedIcon fontSize="small" />
      </Tooltip>
    ))
    .with(AttendeeRole.Participant, () => null)
    .exhaustive()

export const ListItemAttendee = (params: ListItemAttendeeProps) => {
  const { userName, email, isPending, pictureUrl, role, roleEditable, roleDisabled, onRoleChange } = params
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
        primary={
          <NameRow>
            <RoleBadge role={role} />
            <UserName>{isPending ? email : userName}</UserName>
          </NameRow>
        }
        secondary={isPending ? 'Invitation en attente de validation' : email}
      />
      <RoleChipSlot>
        <AttendeeRoleChip role={role} editable={roleEditable} disabled={roleDisabled} onRoleChange={onRoleChange} />
      </RoleChipSlot>
    </>
  )
}
