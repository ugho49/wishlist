import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { SxProps } from '@mui/system'
import React, { PropsWithChildren, useCallback, useState } from 'react'

export type ConfirmMenuItemProps = {
  confirmTitle: string | React.ReactNode
  confirmText: string | React.ReactNode
  confirmButton?: string
  cancelButton?: string
  onClick: () => void
  onCancel?: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}

export const ConfirmMenuItem = ({
  confirmTitle,
  confirmText,
  confirmButton,
  cancelButton,
  children,
  disabled,
  onClick,
  onCancel,
  sx,
}: PropsWithChildren<ConfirmMenuItemProps>) => {
  const [openDialog, setOpenDialog] = useState(false)

  const closeDialog = useCallback(() => {
    setOpenDialog(false)
    onCancel && onCancel()
  }, [])

  return (
    <>
      <MenuItem onClick={() => setOpenDialog(true)} sx={sx} disabled={disabled}>
        {children}
      </MenuItem>
      <Dialog open={openDialog} onClose={() => closeDialog()}>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog()}>{cancelButton || 'Annuler'}</Button>
          <Button
            onClick={() => {
              closeDialog()
              onClick()
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
