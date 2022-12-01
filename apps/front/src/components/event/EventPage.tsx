import React, { useState } from 'react';
import { Box, Chip, Stack, Tab, tabClasses, Tabs, Theme } from '@mui/material';
import { Title } from '../common/Title';
import { Loader } from '../common/Loader';
import { useParams } from 'react-router-dom';
import { useAsync } from 'react-use';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import PeopleIcon from '@mui/icons-material/People';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { makeStyles } from '@mui/styles';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { EventTabWishlists } from './EventTabWishlists';
import { Description } from '../common/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DateTime } from 'luxon';

enum TabTypes {
  lists,
  details,
}

const useStyles = makeStyles((theme: Theme) => ({
  tab: {
    [`&.${tabClasses.root}`]: {
      minHeight: '50px',
    },
  },
}));

export const EventPage = () => {
  const classes = useStyles();
  const [tabType, setTabType] = useState<TabTypes>(TabTypes.lists);
  const params = useParams<'eventId'>();
  const eventId = params.eventId || '';
  const api = useApi(wishlistApiRef);
  const { value: event, loading } = useAsync(() => api.event.getById(eventId), [eventId]);
  const nbAttendees = (event?.attendees || []).length + 1;

  return (
    <Box>
      <Loader loading={loading}>
        {!event && (
          <div>
            {/* TODO --> */}
            <span>Event not found</span>
          </div>
        )}
        {event && (
          <>
            <Title smallMarginBottom>{event.title}</Title>

            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              sx={{ marginBottom: '20px' }}
              gap={1}
            >
              <Chip
                variant="outlined"
                size="small"
                icon={<PersonOutlineOutlinedIcon />}
                label={`Créée par ${event.created_by.firstname} ${event.created_by.lastname}`}
              />
              <Chip
                variant="outlined"
                size="small"
                icon={<PeopleIcon />}
                label={`${nbAttendees} ${nbAttendees > 1 ? 'participants' : 'participant'}`}
              />
              <Chip
                variant="outlined"
                size="small"
                icon={<AccessTimeIcon />}
                label={DateTime.fromISO(event.event_date).toLocaleString(DateTime.DATE_HUGE)}
              />
            </Stack>

            {event.description && <Description text={event.description} />}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: '20px' }}>
              <Tabs value={tabType} onChange={(_, value) => setTabType(value)} variant="fullWidth">
                <Tab
                  className={classes.tab}
                  icon={<FormatListBulletedIcon />}
                  value={TabTypes.lists}
                  label="Listes"
                  iconPosition="start"
                />
                <Tab
                  className={classes.tab}
                  icon={<InfoOutlinedIcon />}
                  value={TabTypes.details}
                  label="Détails"
                  iconPosition="start"
                />
                {/*  TODO: Add settings page for owner of the Event */}
              </Tabs>
            </Box>

            {tabType === TabTypes.lists && <EventTabWishlists event={event} />}
            {tabType === TabTypes.details && <div>Details</div>}
          </>
        )}
      </Loader>
    </Box>
  );
};
