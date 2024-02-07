import { IconButton } from '@mui/material';
import { SnackbarMessage, useSnackbar, VariantType } from 'notistack';
import { useCallback } from 'react';
import CloseIcon from '@mui/icons-material/Close';

type AddToastInput = {
  message: SnackbarMessage;
  variant: VariantType;
};

type AddToastOutput = {
  closeToast: () => void;
};

export function useToast() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const addToast = useCallback(
    (params: AddToastInput): AddToastOutput => {
      const snackbarKey = enqueueSnackbar(params.message, {
        variant: params.variant,
        action: (key) => (
          <IconButton onClick={() => closeSnackbar(key)} color="inherit">
            <CloseIcon />
          </IconButton>
        ),
      });

      return {
        closeToast: () => {
          closeSnackbar(snackbarKey);
        },
      };
    },
    [enqueueSnackbar, closeSnackbar],
  );

  return { addToast };
}
