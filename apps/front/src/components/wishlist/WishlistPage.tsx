import React, { useState } from 'react';
import { Box, Chip, Stack, Tooltip } from '@mui/material';
import { Title } from '../common/Title';
import { Loader } from '../common/Loader';
import { useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { WishlistItems } from './WishlistItems';
import PublicIcon from '@mui/icons-material/Public';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Description } from '../common/Description';
import { WishlistEventsDialog } from './WishlistEventsDialog';

export const WishlistPage = () => {
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const params = useParams<'wishlistId'>();
  const wishlistId = params.wishlistId || '';
  const api = useApi(wishlistApiRef);
  const { value: wishlist, loading } = useAsync(() => api.wishlist.getById(wishlistId), [wishlistId]);

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
          </>
        )}
      </Loader>
    </Box>
  );
};
