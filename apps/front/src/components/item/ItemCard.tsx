import React, { useCallback, useMemo, useState } from 'react';
import { ItemDto, MiniUserDto } from '@wishlist/common-types';
import { Card } from '../common/Card';
import { ItemFormDialog } from './ItemFormDialog';
import {
  Box,
  Checkbox,
  checkboxClasses,
  Chip,
  chipClasses,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  svgIconClasses,
  Theme,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmIconButton } from '../common/ConfirmIconButton';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { DateTime } from 'luxon';
import { Rating } from '../common/Rating';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';

export type ItemCardProps = {
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
    flexDirection: 'row',
    padding: '10px 0 10px 0',
    height: '100%',
    color: theme.palette.primary.main,
    borderBottom: '3px solid transparent',
    '&.selected': {
      borderBottomColor: theme.palette.secondary.main,
    },
    '&.hideCheckbox': {
      paddingLeft: '10px',
    },
    '&.hideActions': {
      paddingRight: '10px',
    },
  },
  checkContainer: {
    minWidth: '50px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    paddingLeft: '4px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    [`& .${svgIconClasses.root}`]: {
      fontSize: '0.75rem',
      marginLeft: '6px',
    },
  },
  description: {
    fontWeight: 300,
    paddingLeft: '4px',
    marginBlock: '4px',
  },
  footerInfo: {
    fontSize: '10px',
    marginTop: 'auto',
    marginBottom: '4px',
    paddingLeft: '4px',
  },
  date: {
    fontWeight: 300,
  },
  suggested: {
    [`&.${chipClasses.root}`]: {
      fontSize: '0.6rem',
      height: '15px',
    },
  },
  info: {
    flexGrow: 1,
  },
  takenBy: {
    fontSize: '10px',
    fontStyle: 'italic',
    fontWeight: 500,
  },
  actions: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    marginLeft: '10px',
    marginRight: '5px',
    paddingLeft: '5px',
    justifyContent: 'space-evenly',
  },
  checkbox: {
    [`&.${checkboxClasses.disabled} .${svgIconClasses.root}`]: {
      color: theme.palette.secondary.dark,
    },
  },
}));

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const ItemCard = ({ item, handleDelete, handleUpdate, wishlist }: ItemCardProps) => {
  const classes = useStyles();
  const { currentUserId } = useSelector(mapState);
  const api = useApi(wishlistApiRef);
  const { addToast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [takenBy, setTakenBy] = useState<MiniUserDto | undefined>(item.taken_by);
  const NameProps = item.url ? { component: Link, href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {};
  const isTaken = useMemo(() => takenBy !== undefined, [takenBy]);
  const ownerOfTheList = currentUserId === wishlist.ownerId;
  const displayCheckbox = !ownerOfTheList || !wishlist.hideItems;
  const displayActions = (ownerOfTheList || item.is_suggested) && !isTaken;

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
          !displayCheckbox && 'hideCheckbox',
          !displayActions && 'hideActions'
        )}
      >
        {displayCheckbox && (
          <Stack className={classes.checkContainer}>
            {loading && <CircularProgress size="1.2rem" />}
            {!loading && (
              <Checkbox
                color="secondary"
                className={classes.checkbox}
                disabled={loading || (takenBy?.id !== currentUserId && takenBy?.id !== undefined)}
                checked={isTaken}
                onClick={() => toggleItem()}
              />
            )}
          </Stack>
        )}

        <Stack className={classes.info}>
          <Box className={classes.name} {...NameProps}>
            <span>{item.name}</span>
            {item.url && <OpenInNewIcon />}
          </Box>
          <Box className={classes.description}>{item.description}</Box>
          <Stack className={classes.footerInfo} direction="row" alignItems="center" justifyContent="space-between">
            <Box className={classes.date}>{DateTime.fromISO(item.created_at).toRelative()}</Box>
            {item.is_suggested && <Chip className={classes.suggested} label="Souhait suggéré" color="secondary" />}
          </Stack>
          <Stack alignItems="center" direction="row" justifyContent="space-between">
            <Rating value={item.score} size="medium" readOnly />
            {isTaken && (
              <Box className={classes.takenBy}>
                (pris par {takenBy?.id === currentUserId ? 'moi' : takenBy?.firstname})
              </Box>
            )}
          </Stack>
        </Stack>
        {displayActions && (
          <Stack className={clsx(classes.actions, 'animated zoomIn faster')}>
            <Tooltip title="Modifier le souhait">
              <IconButton color="info" onClick={() => setOpenDialog(true)} disabled={loading || isTaken} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <ConfirmIconButton
              color="error"
              size="small"
              disabled={loading || isTaken}
              confirmTitle="Supprimer le souhait"
              onClick={() => deleteItem()}
              confirmText={
                <span>
                  Êtes-vous sûr de vouloir supprimer le souhait <b>{item.name}</b> ?
                </span>
              }
            >
              <DeleteIcon />
            </ConfirmIconButton>
          </Stack>
        )}
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
