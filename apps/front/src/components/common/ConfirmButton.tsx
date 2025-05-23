import type { LoadingButtonProps } from '@mui/lab/LoadingButton'
import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/system'
import type { PropsWithChildren } from 'react'

import LoadingButton from '@mui/lab/LoadingButton'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'

export type ConfirmButtonProps = {
  confirmTitle: string | React.ReactNode
  confirmText: string | React.ReactNode
  confirmButton?: string
  cancelButton?: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  startIcon?: LoadingButtonProps['startIcon']
  endIcon?: LoadingButtonProps['endIcon']
  color?: LoadingButtonProps['color']
  size?: LoadingButtonProps['size']
  variant?: LoadingButtonProps['variant']
  sx?: SxProps<Theme>
}

export const ConfirmButton = ({
  confirmTitle,
  confirmText,
  confirmButton,
  cancelButton,
  children,
  loading,
  disabled,
  onClick,
  size,
  color,
  variant,
  startIcon,
  endIcon,
  sx,
}: PropsWithChildren<ConfirmButtonProps>) => {
  const [openDialog, setOpenDialog] = useState(false)

  const closeDialog = useCallback(() => setOpenDialog(false), [])

  const loadingPosition = useMemo(() => {
    if (startIcon) return 'start'
    if (endIcon) return 'end'
    return undefined
  }, [startIcon, endIcon])

  return (
    <>
      <LoadingButton
        sx={sx}
        variant={variant}
        color={color}
        size={size}
        loading={loading}
        loadingPosition={loadingPosition}
        disabled={disabled}
        startIcon={startIcon}
        endIcon={endIcon}
        onClick={() => setOpenDialog(true)}
      >
        {children}
      </LoadingButton>
      <Dialog open={openDialog} onClose={() => closeDialog()} disableScrollLock keepMounted>
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
