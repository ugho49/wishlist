import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined'
import PersonIcon from '@mui/icons-material/Person'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import { Avatar, ListItemAvatar, ListItemText, Stack, Tooltip } from '@mui/material'
import { blue, orange } from '@mui/material/colors'
import { match } from 'ts-pattern'

import { AttendeeRole } from '../../gql'

type ListItemAttendee = {
  userName: string
  role: AttendeeRole
  email: string
  pictureUrl?: string
  isPending: boolean
}

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

export const ListItemAttendee = (params: ListItemAttendee) => {
  const { userName, email, isPending, pictureUrl, role } = params
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
      <ListItemText
        primary={
          <Stack flexDirection="row" gap={1} alignItems="center">
            <RoleBadge role={role} />
            <b>{isPending ? email : userName}</b>
          </Stack>
        }
        secondary={isPending ? 'Invitation en attente de validation' : email}
      />
    </>
  )
}
