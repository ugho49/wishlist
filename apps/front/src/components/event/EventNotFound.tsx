import { Box, Button } from '@mui/material';

import { EmptyState } from '../common/EmptyState';
import { RouterLink } from '../common/RouterLink';
import { Title } from '../common/Title';

export const EventNotFound = () => (
  <Box>
    <Title breadcrumbs={[{ label: 'Évènements', to: '/events' }, { label: 'Évènement introuvable' }]}>
      Évènement introuvable
    </Title>
    <EmptyState
      genieVariant="lost"
      sx={{ marginTop: 4 }}
      title="Même le génie ne le trouve pas…"
      subtitle="Cet évènement a peut-être été supprimé, ou vous n'avez pas les droits pour y accéder."
      actions={
        <Button variant="contained" size="large" component={RouterLink} to="/events">
          Voir mes évènements
        </Button>
      }
    />
  </Box>
);
