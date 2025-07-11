import type { EventId, SecretSantaId, SecretSantaUserDto, SecretSantaUserId } from '@wishlist/common'

import CloseIcon from '@mui/icons-material/Close'
import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { useApi, useToast } from '../../hooks'

export interface ManageUserExclusionsDialogProps {
  open: boolean
  eventId: EventId
  secretSantaId: SecretSantaId
  secretSantaUser?: SecretSantaUserDto
  otherSecretSantaUser: SecretSantaUserDto[]
  handleClose: () => void
}

export const ManageUserExclusionsDialog = ({
  open,
  eventId,
  secretSantaId,
  secretSantaUser,
  otherSecretSantaUser,
  handleClose,
}: ManageUserExclusionsDialogProps) => {
  const queryClient = useQueryClient()
  const api = useApi()
  const { addToast } = useToast()
  const [selected, setSelected] = useState<SecretSantaUserId[]>([])

  const toggleSelect = useCallback(
    (id: SecretSantaUserId) => {
      const checked = selected.includes(id)

      if (!checked) {
        setSelected(prev => [...prev, id])
      } else {
        setSelected(prev => prev.filter(i => i !== id))
      }
    },
    [selected],
  )

  const { mutateAsync: updateUser, isPending: loadingUpdateUser } = useMutation({
    mutationKey: ['secret-santa.user.update', { secretSantaId, secretSantaUserId: secretSantaUser?.id }],
    mutationFn: () =>
      api.secretSanta.updateUser(secretSantaId, secretSantaUser?.id || '', {
        exclusions: selected,
      }),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: async () => {
      handleClose()
      addToast({ message: 'Les exclusions ont été mises à jour', variant: 'success' })
      await queryClient.invalidateQueries({ queryKey: ['secret-santa', { eventId }] })
    },
  })

  useEffect(() => {
    setSelected(secretSantaUser?.exclusions || [])
  }, [secretSantaUser])

  return (
    <Dialog onClose={() => handleClose()} open={open} fullWidth maxWidth="xs" disableEscapeKeyDown={loadingUpdateUser}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <span>Exclusions</span>
          <IconButton onClick={() => handleClose()} disabled={loadingUpdateUser}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 0 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Sélectionnez les participants que vous souhaitez exclure de votre tirage.
        </Typography>
        <List>
          {otherSecretSantaUser.map(santaUser => (
            <ListItem
              key={santaUser.id}
              secondaryAction={
                <Checkbox
                  edge="end"
                  onChange={() => toggleSelect(santaUser.id)}
                  checked={selected.includes(santaUser.id)}
                />
              }
              disablePadding
            >
              <ListItemButton onClick={() => toggleSelect(santaUser.id)}>
                <ListItemAvatar>
                  <Avatar src={santaUser.attendee.user?.picture_url} />
                </ListItemAvatar>
                <ListItemText
                  id={santaUser.id}
                  primary={
                    santaUser.attendee.pending_email
                      ? santaUser.attendee.pending_email
                      : `${santaUser.attendee.user?.firstname} ${santaUser.attendee.user?.firstname}`
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => updateUser()}>
          Enregistrer les modifications
        </Button>
      </DialogActions>
    </Dialog>
  )
}
