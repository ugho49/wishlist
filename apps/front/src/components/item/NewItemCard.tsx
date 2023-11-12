import React, { useCallback, useMemo, useState } from 'react';
import { ItemDto, MiniUserDto } from '@wishlist/common-types';
import { Card } from '../common/Card';
import RedeemIcon from '@mui/icons-material/Redeem';
import { ItemFormDialog } from './ItemFormDialog';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TipsAndUpdatesTwoToneIcon from '@mui/icons-material/TipsAndUpdatesTwoTone';
import {
  Avatar,
  Box,
  Chip,
  chipClasses,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Theme,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { DateTime } from 'luxon';
import { Rating } from '../common/Rating';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { ConfirmMenuItem } from '../common/ConfirmMenuItem';

export type NewItemCardProps = {
  wishlist: {
    id: string;
    ownerId: string;
    hideItems: boolean;
  };
  item: ItemDto;
  handleUpdate: (newValue: ItemDto) => void;
  handleDelete: () => void;
};

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    padding: '15px 20px',
    color: theme.palette.primary.main,
  },
  actions: {
    position: 'absolute',
    top: '10px',
    right: '10px',
  },
  name: {
    fontWeight: '500 !important',
    wordWrap: 'break-word',
    textAlign: 'center',
  },
  description: {
    fontWeight: 300,
    wordWrap: 'break-word',
    textAlign: 'center',
  },
  suggested: {
    [`&.${chipClasses.root}`]: {
      fontSize: '0.6rem',
      height: '15px',
    },
  },
  date: {
    fontWeight: 300,
    fontSize: '0.6rem',
    color: theme.palette.grey[600],
  },
  takenBy: {
    position: 'absolute',
    top: 0,
    left: 0,
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    width: '100%',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
    zIndex: 2,
    height: '45px',
    boxShadow: '0 0 1px 0 rgba(87, 113, 149, 0.3), 0 2px 4px -2px rgba(87, 113, 149, 0.5)',
  },
}));

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const NewItemCard = ({ item, handleDelete, handleUpdate, wishlist }: NewItemCardProps) => {
  const classes = useStyles();
  const { currentUserId } = useSelector(mapState);
  const api = useApi(wishlistApiRef);
  const { addToast } = useToast();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [takenBy, setTakenBy] = useState<MiniUserDto | undefined>(item.taken_by);
  const NameProps = item.url ? { component: Link, href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  const isTaken = useMemo(() => takenBy !== undefined, [takenBy]);
  const ownerOfTheList = currentUserId === wishlist.ownerId;
  const displayCheckbox = !ownerOfTheList || !wishlist.hideItems;
  const displayActions = (ownerOfTheList || item.is_suggested) && !isTaken;

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const deleteItem = async () => {
    setLoading(true);
    try {
      await api.item.delete(item.id);
      addToast({ message: 'Le souhait à bien été supprimé', variant: 'success' });
      handleDelete();
    } catch (e) {
      setLoading(false);
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    }
  };

  const toggleItem = useCallback(async () => {
    setLoading(true);
    try {
      const action = isTaken ? 'uncheck' : 'check';
      const res = await api.item.toggle(item.id);
      setTakenBy(res.taken_by);

      if (action === 'check') {
        addToast({
          message: (
            <span>
              Vous avez coché : <b>{item.name}</b>
            </span>
          ),
          variant: 'success',
        });
      } else {
        addToast({
          message: (
            <span>
              Le souhait <b>{item.name}</b> est à nouveau disponible
            </span>
          ),
          variant: 'info',
        });
      }
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    }
    setLoading(false);
  }, [isTaken, item]);

  return (
    <>
      <Card
        className={clsx(
          classes.card,
          'animated zoomIn faster',
          isTaken && 'selected',
          !displayActions && 'hideActions',
        )}
      >
        <Box className={classes.actions}>
          {displayActions && (
            <>
              <IconButton onClick={openMenu}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu id="basic-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                <MenuItem
                  onClick={() => {
                    closeMenu();
                    setOpenDialog(true);
                  }}
                >
                  <ListItemIcon>
                    <EditTwoToneIcon />
                  </ListItemIcon>
                  <ListItemText>Modifier</ListItemText>
                </MenuItem>
                <ConfirmMenuItem
                  onClick={() => deleteItem()}
                  onCancel={() => closeMenu()}
                  confirmTitle="Supprimer le souhait"
                  confirmText={
                    <span>
                      Êtes-vous sûr de vouloir supprimer le souhait <b>{item.name}</b> ?
                    </span>
                  }
                >
                  <ListItemIcon>
                    <DeleteForeverTwoToneIcon />
                  </ListItemIcon>
                  <ListItemText>Supprimer</ListItemText>
                </ConfirmMenuItem>
              </Menu>
            </>
          )}
        </Box>
        {isTaken && (
          <Stack alignItems="center" justifyContent="center" gap={2} direction="row" className={classes.takenBy}>
            <Box>Pris par</Box>
            <Avatar
              src={takenBy?.picture_url}
              sx={{ height: '32px', width: '32px', bgcolor: takenBy?.picture_url ? 'white' : undefined }}
            >
              {takenBy?.firstname?.toUpperCase()?.charAt(0)}
            </Avatar>
          </Stack>
        )}
        <Stack alignItems="center">
          <Avatar
            src={item.picture_url}
            sx={(theme) => ({
              height: '120px',
              width: '120px',
              bgcolor: theme.palette.grey[200],
              color: theme.palette.grey[500],
              boxShadow: '0 0 1px 0 rgba(87, 113, 149, 0.3), 0 2px 4px -2px rgba(87, 113, 149, 0.5)',
            })}
          >
            <RedeemIcon fontSize="large" />
          </Avatar>
        </Stack>
        <Stack alignItems="center" marginTop={2} marginBottom={1}>
          <Rating value={item.score} size="small" readOnly />
        </Stack>
        <Stack alignItems="center" justifyContent="center" flexGrow={1}>
          <Box className={classes.name} {...NameProps}>
            {capitalizeFirstLetter(item.name.toLowerCase())}
          </Box>
          {item.description && (
            <Box marginTop={0.5} className={classes.description}>
              {item.description}
            </Box>
          )}
        </Stack>
        {item.is_suggested && (
          <Stack alignItems="center" marginTop={1.5}>
            <Tooltip title="Ce souhait n'est pas visible du créateur de la liste car il a été suggéré par un utilisateur">
              <Chip
                className={classes.suggested}
                icon={<TipsAndUpdatesTwoToneIcon sx={{ fontSize: '0.7rem' }} />}
                label="Souhait suggéré"
                color="success"
                variant="outlined"
              />
            </Tooltip>
          </Stack>
        )}
        {displayCheckbox && (
          <Stack alignItems="center" marginTop={1.5}>
            <LoadingButton
              size="small"
              sx={{ fontSize: '0.75rem', opacity: 0.8 }}
              variant="contained"
              onClick={() => toggleItem()}
              loading={loading}
              disabled={loading || (takenBy?.id !== currentUserId && takenBy?.id !== undefined)}
            >
              {takenBy?.id === currentUserId && takenBy?.id !== undefined && <>Ne plus prendre</>}
              {(takenBy?.id === undefined || takenBy?.id !== currentUserId) && <>Réserver ce cadeau</>}
            </LoadingButton>
          </Stack>
        )}
        <Stack marginTop={1} alignItems="center" className={classes.date}>
          Ajouté {DateTime.fromISO(item.created_at).toRelative()}
        </Stack>
      </Card>
      <ItemFormDialog
        mode="edit"
        title="Modifier le souhait"
        item={item}
        wishlistId={wishlist.id}
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        handleUpdate={(updatedItem) => handleUpdate(updatedItem)}
      />
    </>
  );
};
