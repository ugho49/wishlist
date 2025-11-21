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

export type CheckPasswordModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: (password: string) => void | Promise<void>
  loading?: boolean
}

export const CheckPasswordModal = ({ onClose, open, onConfirm, loading = false }: CheckPasswordModalProps) => {
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onConfirm(password)
    setPassword('')
  }

  const handleClose = () => {
    setPassword('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Vérification du mot de passe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pour des raisons de sécurité, veuillez saisir votre mot de passe actuel pour confirmer cette action.
          </DialogContentText>
          <TextField
            autoFocus
            onChange={e => setPassword(e.target.value)}
            value={password}
            margin="normal"
            type="password"
            fullWidth
            variant="standard"
            disabled={loading}
            required
            placeholder="Mot de passe actuel"
            autoComplete="current-password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="contained" type="submit" disabled={loading || !password}>
            Confirmer
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
