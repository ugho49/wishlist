import React, { useState } from 'react';
import { Box, Chip, Stack, Tab, tabClasses, Tabs, Theme, Tooltip } from '@mui/material';
import { Title } from '../components/Title';
import { Loader } from '../components/Loader';
import { useParams } from 'react-router-dom';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useAsync } from 'react-use';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../core/api/wishlist.api';
import { WishlistItems } from '../components/wishlist/WishlistItems';
import { WishlistDetails } from '../components/wishlist/WishlistDetails';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { makeStyles } from '@mui/styles';
import PublicIcon from '@mui/icons-material/Public';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

enum TabTypes {
  items,
  settings,
}

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    [`&.${tabClasses.root}`]: {
      minHeight: '50px',
    },
  },
  description: {
    color: theme.palette.primary.main,
    textAlign: 'center',
    boxShadow: 'rgb(0 0 0 / 5%) 0px 0px 0px 1px',
    padding: '12px',
    backgroundColor: '#ffffff',
    marginBottom: '20px',
  },
}));

export const WishlistPage = () => {
  const classes = useStyles();
  const [tabType, setTabType] = useState<TabTypes>(TabTypes.items);
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

            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ marginBottom: '20px' }} gap={1}>
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
                label={`${wishlist.events.length} ${wishlist.events.length > 1 ? 'évènements' : 'évènement'}`}
              />
            </Stack>

            {wishlist.description && <Box className={classes.description}>{wishlist.description}</Box>}

            <Tabs
              value={tabType}
              onChange={(_, value) => setTabType(value)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}
            >
              <Tab
                className={classes.tab}
                icon={<PlaylistAddCheckIcon />}
                value={TabTypes.items}
                label="Souhaits"
                iconPosition="start"
              />
              <Tab
                className={classes.tab}
                icon={<InfoOutlinedIcon />}
                value={TabTypes.settings}
                label="Détails"
                iconPosition="start"
              />
              {/*  TODO: Add settings page for owner of the list */}
            </Tabs>

            {tabType === TabTypes.items && <WishlistItems wishlist={wishlist} />}
            {tabType === TabTypes.settings && <WishlistDetails wishlist={wishlist} />}
          </>
        )}
      </Loader>
    </Box>
  );
};
