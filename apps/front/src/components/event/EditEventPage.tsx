import React from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useAsync } from 'react-use';
import { Box } from '@mui/material';
import { Loader } from '../common/Loader';
import { EventNotFound } from './EventNotFound';

export const EditEventPage = () => {
  const params = useParams<'eventId'>();
  const eventId = params.eventId || '';
  const api = useApi(wishlistApiRef);
  const { value: event, loading } = useAsync(() => api.event.getById(eventId), [eventId]);

  return (
    <Box>
      <Loader loading={loading}>{!event && <EventNotFound />}</Loader>
    </Box>
  );
};
