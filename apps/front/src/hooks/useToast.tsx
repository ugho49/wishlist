import type { SnackbarMessage, VariantType } from 'notistack'

import CloseIcon from '@mui/icons-material/Close'
import { IconButton } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useCallback } from 'react'

type AddToastInput = {
  message: SnackbarMessage
  variant: VariantType
}

type AddToastOutput = {
  closeToast: () => void
}

export function useToast() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const addToast = useCallback(
    (params: AddToastInput): AddToastOutput => {
      const snackbarKey = enqueueSnackbar(params.message, {
        variant: params.variant,
        action: key => (
          <IconButton onClick={() => closeSnackbar(key)} color="inherit">
            <CloseIcon />
          </IconButton>
        ),
      })

      return {
        closeToast: () => {
          closeSnackbar(snackbarKey)
        },
      }
    },
    [enqueueSnackbar, closeSnackbar],
  )

  return { addToast }
}
