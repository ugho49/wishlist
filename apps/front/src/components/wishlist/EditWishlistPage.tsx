import React from 'react';
import { useParams } from 'react-router-dom';
import { useCustomSearchParams, useWishlistById } from '@wishlist-front/hooks';
import { Box, Tab, Tabs } from '@mui/material';
import { Loader } from '../common/Loader';
import { WishlistNotFound } from './WishlistNotFound';
import { Title } from '../common/Title';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Card } from '../common/Card';
import { EditWishlistInformations } from './EditWishlistInformations';
import { EditWishlistEvent } from './EditWishlistEvents';

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
  const [queryParams, setQueryParams] = useCustomSearchParams<SearchParamType>({ tab: tabs[0].value });
  const { wishlist, loading } = useWishlistById(wishlistId);

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
              {queryParams.tab === TabValues.informations && <EditWishlistInformations wishlist={wishlist} />}
              {queryParams.tab === TabValues.events && (
                <EditWishlistEvent wishlistId={wishlist.id} events={wishlist.events} />
              )}
            </Card>
          </>
        )}
      </Loader>
    </Box>
  );
};
