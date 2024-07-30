import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { SxProps } from '@mui/system'
import React, { useCallback, useState } from 'react'

export type ConfirmCheckboxProps = {
  confirmTitle: string | React.ReactNode
  confirmText: string | React.ReactNode
  confirmButton?: string
  cancelButton?: string
  onChange: (check: boolean) => void
  disabled?: boolean
  loading?: boolean
  checked: boolean
  confirmOnUncheck?: boolean
  sx?: SxProps<Theme>
}

export const ConfirmCheckbox = ({
  confirmTitle,
  confirmText,
  confirmButton,
  cancelButton,
  checked,
  confirmOnUncheck = false,
  disabled,
  onChange,
  sx,
}: ConfirmCheckboxProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [nextState, setNextState] = useState<boolean | undefined>()
  const closeDialog = useCallback(() => setOpenDialog(false), [])

  return (
    <>
      <Checkbox
        sx={sx}
        checked={checked}
        onChange={e => {
          const nextChecked = e.target.checked
          if (checked && !confirmOnUncheck) {
            onChange(nextChecked)
            return
          }
          setNextState(nextChecked)
          setOpenDialog(true)
        }}
        disabled={disabled}
      />
      <Dialog open={openDialog} onClose={() => closeDialog()} disableScrollLock keepMounted>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">{confirmText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog()}>{cancelButton || 'Annuler'}</Button>
          <Button
            onClick={() => {
              onChange(nextState || false)
              closeDialog()
            }}
            autoFocus
          >
            {confirmButton || 'Oui'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
