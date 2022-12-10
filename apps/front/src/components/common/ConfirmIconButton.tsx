import React, { PropsWithChildren, useCallback, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  IconButtonTypeMap,
  Tooltip,
} from '@mui/material';

export type ConfirmIconButtonProps = {
  confirmTitle: string | React.ReactNode;
  confirmText: string | React.ReactNode;
  confirmButton?: string;
  cancelButton?: string;
  onClick: () => void;
  disabled?: boolean;
  color?: IconButtonTypeMap['props']['color'];
  size?: IconButtonTypeMap['props']['size'];
};

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
  const [openDialog, setOpenDialog] = useState(false);

  const closeDialog = useCallback(() => setOpenDialog(false), []);

  return (
    <>
      <Tooltip title={confirmTitle}>
        <IconButton color={color} size={size} disabled={disabled} onClick={() => setOpenDialog(true)}>
          {children}
        </IconButton>
      </Tooltip>
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
