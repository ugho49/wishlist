import React, { useCallback, useMemo, useState } from 'react';
import { ItemDto, MiniUserDto } from '@wishlist/common-types';
import { Card } from '../common/Card';
import { ItemFormDialog } from './ItemFormDialog';
import {
  Avatar,
  Box,
  Checkbox,
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
    flexGrow: 1,
    flexDirection: 'row',
    padding: '10px 0 10px 10px',
    height: '100%',
    color: theme.palette.primary.main,
    borderBottom: '3px solid transparent',
    '&.selected': {
      borderBottomColor: theme.palette.secondary.main,
    },
    '&.hideActions': {
      paddingRight: '10px',
    },
  },
  name: {
    paddingLeft: '4px',
    fontWeight: '500 !important',
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
  actions: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    marginLeft: '10px',
    marginRight: '5px',
    paddingLeft: '5px',
    justifyContent: 'space-evenly',
  },
  checkbox: {
    margin: 0,
  },
  takerAvatar: {
    border: `2px solid ${theme.palette.secondary.main}`,
    margin: '5px',
  },
}));

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const ItemCard = ({ item, handleDelete, handleUpdate, wishlist }: ItemCardProps) => {
  const classes = useStyles();
  const { currentUserId } = useSelector(mapState);
  const api = useApi(wishlistApiRef);
  const { addToast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [pictureHover, setPictureHover] = useState(false);
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

  const hoverTakerPicture = () => {
    if (takenBy?.id !== currentUserId && takenBy?.id !== undefined) return;
    setPictureHover(true);
  };

  return (
    <>
      <Stack
        direction="row"
        gap={1}
        sx={{ height: '100%' }}
        onMouseEnter={hoverTakerPicture}
        onMouseLeave={() => setPictureHover(false)}
      >
        {displayCheckbox && (
          <Stack justifyContent="center">
            <>
              {isTaken && !pictureHover && (
                <Tooltip title={`pris par ${takenBy?.firstname}`} arrow>
                  <Avatar
                    className={classes.takerAvatar}
                    src={takenBy?.picture_url}
                    sx={{ height: '32px', width: '32px' }}
                  >
                    {takenBy?.firstname?.toUpperCase()?.charAt(0)}
                  </Avatar>
                </Tooltip>
              )}
              {(!isTaken || pictureHover) && (
                <>
                  {loading && (
                    <Box sx={{ margin: '6px' }}>
                      <CircularProgress size="30px" />
                    </Box>
                  )}
                  {!loading && (
                    <Checkbox
                      color="secondary"
                      className={classes.checkbox}
                      disabled={loading || (takenBy?.id !== currentUserId && takenBy?.id !== undefined)}
                      checked={isTaken}
                      onClick={() => toggleItem()}
                    />
                  )}
                </>
              )}
            </>
          </Stack>
        )}
        <Card
          className={clsx(
            classes.card,
            'animated zoomIn faster',
            isTaken && 'selected',
            !displayActions && 'hideActions',
          )}
        >
          <Stack className={classes.info}>
            <Box className={classes.name} {...NameProps}>
              <span>{item.name}</span>
              {item.url && <OpenInNewIcon />}
            </Box>
            <Box className={classes.description}>{item.description}</Box>
            <Stack className={classes.footerInfo} direction="row" alignItems="center" justifyContent="space-between">
              <Box className={classes.date}>{DateTime.fromISO(item.created_at).toRelative()}</Box>
            </Stack>
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Rating value={item.score} size="medium" readOnly />
              {item.is_suggested && (
                <Chip className={classes.suggested} label="Souhait suggéré" color="primary" variant="outlined" />
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
      </Stack>

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
