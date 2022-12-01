import React, { useState } from 'react';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import { Title } from '../common/Title';
import { Loader } from '../common/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
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
import { useSnackbar } from 'notistack';

const mapState = (state: RootState) => ({ currentUserId: state.auth.user?.id });

export const WishlistPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { currentUserId } = useSelector(mapState);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const params = useParams<'wishlistId'>();
  const wishlistId = params.wishlistId || '';
  const api = useApi(wishlistApiRef);
  const navigate = useNavigate();

  const { value: wishlist, loading } = useAsync(() => api.wishlist.getById(wishlistId), [wishlistId]);

  const deleteWishlist = async () => {
    try {
      await api.wishlist.delete(wishlistId);
      enqueueSnackbar('La liste à bien été supprimée', { variant: 'success' });
      navigate('/wishlists');
    } catch (e) {
      enqueueSnackbar("Une erreur s'est produite", { variant: 'error' });
    }
  };

  return (
    <Box>
      <Loader loading={loading}>
        {!wishlist && (
          <div>
            {/* TODO --> */}
            <span>List not found</span>
          </div>
        )}

        {wishlist && (
          <>
            <Title smallMarginBottom>{wishlist.title}</Title>

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
                icon={<PersonOutlineOutlinedIcon />}
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

            {wishlist.owner.id === currentUserId && (
              <Stack alignItems="center" justifyContent="center" sx={{ marginTop: '100px' }}>
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
              </Stack>
            )}
          </>
        )}
      </Loader>
    </Box>
  );
};
