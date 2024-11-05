import type { IconButtonTypeMap } from '@mui/material'
import type { PropsWithChildren } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material'
import React, { useCallback, useState } from 'react'

export type ConfirmIconButtonProps = {
  confirmTitle: string | React.ReactNode
  confirmText: string | React.ReactNode
  confirmButton?: string
  cancelButton?: string
  onClick: () => void
  disabled?: boolean
  color?: IconButtonTypeMap['props']['color']
  size?: IconButtonTypeMap['props']['size']
}

export const ConfirmIconButton = ({
  confirmTitle,
  confirmText,
  confirmButton,
  cancelButton,
  children,
  disabled,
  onClick,
  size,
  color,
}: PropsWithChildren<ConfirmIconButtonProps>) => {
  const [openDialog, setOpenDialog] = useState(false)

  const closeDialog = useCallback(() => setOpenDialog(false), [])

  return (
    <>
      <IconButton color={color} size={size} disabled={disabled} onClick={() => setOpenDialog(true)}>
        <Tooltip title={confirmTitle} children={children as React.ReactElement} />
      </IconButton>
      <Dialog open={openDialog} onClose={() => closeDialog()}>
        <DialogTitle component="div">{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">{confirmText}</DialogContentText>
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
