import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApi, useCustomSearchParams } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Box, Tab, Tabs } from '@mui/material';
import { Loader } from '../common/Loader';
import { WishlistNotFound } from './WishlistNotFound';
import { Title } from '../common/Title';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Card } from '../common/Card';
import { EditWishlistInformations } from './EditWishlistInformations';
import { EditWishlistEvent } from './EditWishlistEvents';
import { DetailedWishlistDto } from '@wishlist/common-types';

enum TabValues {
  informations = 'informations',
  events = 'events',
}

const tabs = [
  {
    value: TabValues.informations,
    label: 'Informations',
    icon: <InfoOutlinedIcon />,
  },
  {
    value: TabValues.events,
    label: 'Evènements',
    icon: <CalendarMonthIcon />,
  },
];

type SearchParamType = { tab: TabValues };

export const EditWishlistPage = () => {
  const params = useParams<'wishlistId'>();
  const wishlistId = params.wishlistId || '';
  const api = useApi(wishlistApiRef);
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0].value });
  const [wishlist, setWishlist] = useState<DetailedWishlistDto | undefined>(undefined);
  const { value, loading } = useAsync(() => api.wishlist.getById(wishlistId), [wishlistId]);

  useEffect(() => {
    if (value) setWishlist(value);
  }, [value]);

  return (
    <Box>
      <Loader loading={loading}>
        {!wishlist && <WishlistNotFound />}
        {wishlist && (
          <>
            <Title smallMarginBottom goBackLink={{ to: `/wishlists/${wishlistId}`, title: 'Revenir à la liste' }}>
              Modifier la liste
            </Title>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
              <Tabs
                value={queryParams.tab}
                onChange={(_, newValue) => setQueryParams({ tab: newValue })}
                variant="fullWidth"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                {tabs.map((tab) => (
                  <Tab key={tab.value} value={tab.value} label={tab.label} iconPosition="start" icon={tab.icon} />
                ))}
              </Tabs>
            </Box>
            <Card>
              {queryParams.tab === TabValues.informations && (
                <EditWishlistInformations
                  wishlist={wishlist}
                  onChange={(updatedValues) => setWishlist({ ...wishlist, ...updatedValues })}
                />
              )}
              {queryParams.tab === TabValues.events && (
                <EditWishlistEvent
                  wishlistId={wishlist.id}
                  events={wishlist.events}
                  onChange={(events) => setWishlist({ ...wishlist, events })}
                />
              )}
            </Card>
          </>
        )}
      </Loader>
    </Box>
  );
};
