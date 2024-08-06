import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined'
import PersonIcon from '@mui/icons-material/Person'
import { Avatar, ListItemAvatar, ListItemText, Stack, Tooltip } from '@mui/material'
import { blue, orange } from '@mui/material/colors'
import { AttendeeRole } from '@wishlist/common-types'
import React from 'react'

type ListItemAttendee = {
  userName: string
  role: AttendeeRole
  email: string
  pictureUrl?: string
  isPending: boolean
}

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
            {role === AttendeeRole.MAINTAINER && (
              <Tooltip title="Admin de la liste">
                <LocalPoliceOutlinedIcon fontSize="small" />
              </Tooltip>
            )}
            <b>{isPending ? email : userName}</b>
          </Stack>
        }
        secondary={isPending ? 'Invitation en attente de validation' : email}
      />
    </>
  )
}
