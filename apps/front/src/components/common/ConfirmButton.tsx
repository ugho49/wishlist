import React, { PropsWithChildren, useCallback, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { LoadingButtonTypeMap } from '@mui/lab/LoadingButton/LoadingButton';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export type ConfirmButtonProps = {
  confirmTitle: string | React.ReactNode;
  confirmText: string | React.ReactNode;
  confirmButton?: string;
  cancelButton?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: LoadingButtonTypeMap['props']['startIcon'];
  color?: LoadingButtonTypeMap['props']['color'];
  size?: LoadingButtonTypeMap['props']['size'];
  variant?: LoadingButtonTypeMap['props']['variant'];
};

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
}: PropsWithChildren<ConfirmButtonProps>) => {
  const [openDialog, setOpenDialog] = useState(false);

  const closeDialog = useCallback(() => setOpenDialog(false), []);

  return (
    <>
      <LoadingButton
        variant={variant}
        color={color}
        size={size}
        loading={loading}
        loadingPosition="start"
        disabled={disabled}
        startIcon={startIcon}
        onClick={() => setOpenDialog(true)}
      >
        {children}
      </LoadingButton>
      <Dialog open={openDialog} onClose={() => closeDialog()}>
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog()}>{cancelButton || 'Annuler'}</Button>
          <Button
            onClick={() => {
              closeDialog();
              onClick();
            }}
            autoFocus
          >
            {confirmButton || 'Oui'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
