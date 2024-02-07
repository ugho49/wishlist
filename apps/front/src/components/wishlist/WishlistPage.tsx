import React, { useState } from 'react';
import { Avatar, Box, Button, Chip, Stack, Tooltip } from '@mui/material';
import { Title } from '../common/Title';
import { Loader } from '../common/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { RouterLink } from '@wishlist/common-front';
import { useApi, useToast } from '@wishlist-front/hooks';
import { WishlistItems } from './WishlistItems';
import PublicIcon from '@mui/icons-material/Public';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Description } from '../common/Description';
import { WishlistEventsDialog } from './WishlistEventsDialog';
import { ConfirmButton } from '../common/ConfirmButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { RootState } from '../../core';
import { useSelector } from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import { WishlistNotFound } from './WishlistNotFound';

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const WishlistPage = () => {
  const { addToast } = useToast();
  const { currentUserId } = useSelector(mapState);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const params = useParams<'wishlistId'>();
  const wishlistId = params.wishlistId || '';
  const api = useApi();
  const navigate = useNavigate();

  const { value: wishlist, loading } = useAsync(() => api.wishlist.getById(wishlistId), [wishlistId]);

  const deleteWishlist = async () => {
    try {
      await api.wishlist.delete(wishlistId);
      addToast({ message: 'La liste à bien été supprimée', variant: 'success' });
      navigate('/wishlists');
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    }
  };

  return (
    <Box>
      <Loader loading={loading}>
        {!wishlist && <WishlistNotFound />}

        {wishlist && (
          <>
            <Title smallMarginBottom>{wishlist.title}</Title>

            {wishlist.owner.id === currentUserId && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={1}
                flexWrap="wrap"
                sx={{ marginBottom: '20px' }}
              >
                <ConfirmButton
                  confirmTitle="Supprimer la liste"
                  confirmText={
                    <span>
                      Êtes-vous sûr de vouloir supprimer la liste <b>{wishlist.title}</b> ?
                    </span>
                  }
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => deleteWishlist()}
                >
                  Supprimer la liste
                </ConfirmButton>
                <Button
                  component={RouterLink}
                  to={`/wishlists/${wishlistId}/edit`}
                  variant="outlined"
                  color="info"
                  size="small"
                  startIcon={<EditIcon />}
                >
                  Modifier la liste
                </Button>
              </Stack>
            )}

            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              sx={{ marginBottom: '20px' }}
              gap={1}
            >
              {!wishlist.config.hide_items && (
                <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
                  <Chip label="Publique" color="info" variant="outlined" size="small" icon={<PublicIcon />} />
                </Tooltip>
              )}
              <Chip
                variant="outlined"
                size="small"
                avatar={
                  wishlist.owner.picture_url ? (
                    <Avatar src={wishlist.owner.picture_url} />
                  ) : (
                    <PersonOutlineOutlinedIcon />
                  )
                }
                label={`Créée par ${wishlist.owner.firstname} ${wishlist.owner.lastname}`}
              />
              <Chip
                variant="outlined"
                size="small"
                icon={<CalendarMonthIcon />}
                onClick={() => setOpenEventDialog(true)}
                label={`${wishlist.events.length} ${wishlist.events.length > 1 ? 'évènements' : 'évènement'}`}
              />
            </Stack>

            {wishlist.description && <Description text={wishlist.description} />}

            <WishlistItems wishlist={wishlist} />

            <WishlistEventsDialog
              open={openEventDialog}
              handleClose={() => setOpenEventDialog(false)}
              events={wishlist.events}
            />
          </>
        )}
      </Loader>
    </Box>
  );
};
