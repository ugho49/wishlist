import type { EventId, SecretSantaId, SecretSantaUserId } from '@wishlist/common'
import type { SecretSantaUserItem } from './secret-santa.types'

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
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { useUpdateSecretSantaUserMutation } from '../../gql'
import { GraphqlRejectionError, unwrapResult } from '../../gql/result'
import { useToast } from '../../hooks'

export interface ManageUserExclusionsDialogProps {
  open: boolean
  eventId: EventId
  secretSantaId: SecretSantaId
  secretSantaUser: SecretSantaUserItem
  otherSecretSantaUser: SecretSantaUserItem[]
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
  const { addToast } = useToast()
  const [selected, setSelected] = useState<SecretSantaUserId[]>([])

  const toggleSelect = useCallback(
    (id: SecretSantaUserId) => {
      const checked = selected.includes(id)

      if (checked) {
        setSelected(prev => prev.filter(i => i !== id))
      } else {
        setSelected(prev => [...prev, id])
      }
    },
    [selected],
  )

  const { mutateAsync: updateUserMutation, isPending: loadingUpdateUser } = useUpdateSecretSantaUserMutation()

  const updateUser = async () => {
    try {
      const res = await updateUserMutation({
        id: secretSantaId,
        secretSantaUserId: secretSantaUser.id,
        input: { exclusions: selected },
      })
      unwrapResult(res.updateSecretSantaUser, 'VoidOutput')
      handleClose()
      addToast({ message: 'Les exclusions ont été mises à jour', variant: 'success' })
      await queryClient.invalidateQueries({ queryKey: ['GetSecretSantaForEvent', { eventId }] })
    } catch (error) {
      const message = error instanceof GraphqlRejectionError ? error.message : "Une erreur s'est produite"
      addToast({ message, variant: 'error' })
    }
  }

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
                  <Avatar src={santaUser.attendee.user?.pictureUrl ?? undefined} />
                </ListItemAvatar>
                <ListItemText
                  id={santaUser.id}
                  primary={
                    santaUser.attendee.pendingEmail
                      ? santaUser.attendee.pendingEmail
                      : `${santaUser.attendee.user?.firstName} ${santaUser.attendee.user?.lastName}`
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
