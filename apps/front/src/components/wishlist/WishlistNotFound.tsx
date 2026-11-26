import { Box, Button } from '@mui/material';

import { EmptyState } from '../common/EmptyState';
import { RouterLink } from '../common/RouterLink';
import { Title } from '../common/Title';

export const WishlistNotFound = () => (
  <Box>
    <Title breadcrumbs={[{ label: 'Mes listes', to: '/wishlists' }, { label: 'Liste introuvable' }]}>
      Liste introuvable
    </Title>
    <EmptyState
      genieVariant="lost"
      sx={{ marginTop: 4 }}
      title="Même le génie ne la trouve pas…"
      subtitle="Cette liste a peut-être été supprimée, ou vous n'avez pas les droits pour y accéder."
      actions={
        <Button variant="contained" size="large" component={RouterLink} to="/wishlists">
          Voir mes listes
        </Button>
      }
    />
  </Box>
);
