import React, { forwardRef, useState } from 'react';
import { ItemDto } from '@wishlist/common-types';
import { AppBar, Dialog, IconButton, Slide, Toolbar, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';

const Transition = forwardRef((props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ModeProps<T> = T extends 'create'
  ? { mode: 'create'; item?: never }
  : T extends 'edit'
  ? { mode: 'edit'; item: ItemDto }
  : never;

export type ItemFormDialogProps = (ModeProps<'create'> | ModeProps<'edit'>) & {
  open: boolean;
  handleClose: () => void;
};

export const ItemFormDialog = ({ open, item, mode, handleClose }: ItemFormDialogProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }} variant="h6" component="div">
            {mode === 'create' ? 'Ajouter un souhait' : 'Modifier le souhait'}
          </Typography>
          <IconButton edge="start" color="inherit" disabled={loading} onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Dialog>
  );
};
