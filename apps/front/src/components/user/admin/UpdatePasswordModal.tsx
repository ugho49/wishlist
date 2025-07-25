import type { UserId } from '@wishlist/common'
import type { FormEvent } from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useState } from 'react'

import { useApi } from '../../../hooks/useApi'
import { useToast } from '../../../hooks/useToast'

export type UpdatePasswordModalProps = {
  open: boolean
  onClose: () => void
  userId: UserId
}

export const UpdatePasswordModal = ({ onClose, open, userId }: UpdatePasswordModalProps) => {
  const { admin: api } = useApi()
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.user.update(userId, { new_password: newPassword })
      addToast({ message: 'Mot de passe mis à jour', variant: 'success' })
      setLoading(false)
      setNewPassword('')
      onClose()
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    }
  }

  return (
    <Dialog open={open} onClose={() => onClose()}>
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <DialogContent>
          <DialogContentText>Entrer ci dessous le nouveau mot de passe de l'utilisateur</DialogContentText>
          <TextField
            autoFocus
            onChange={e => setNewPassword(e.target.value)}
            value={newPassword}
            margin="normal"
            type="password"
            fullWidth
            variant="standard"
            disabled={loading}
            required
            slotProps={{ htmlInput: { maxLength: 50, minLength: 8 } }}
            placeholder="********"
            error={newPassword.length > 0 && newPassword.length < 8}
            helperText="8 caractères minimum"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()} disabled={loading}>
            Annuler
          </Button>
          <Button variant="contained" type="submit" disabled={loading}>
            Appliquer
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
