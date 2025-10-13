import { Box, Button, Stack } from '@mui/material'

import { RouterLink } from '../common/RouterLink'
import { Title } from '../common/Title'

export const EventNotFound = () => {
  return (
    <Box>
      <Title>Évènement introuvable</Title>
      <Stack alignItems="center">
        <p>Cet évènement n'existe pas ou bien n'est pas accessible</p>
        <p>
          <b>Plusieurs raison possible :</b> celui ci à été supprimé, vous n'avez pas les droits pour y accéder ou bien
          il n'existe pas.
        </p>
        <Button variant="contained" component={RouterLink} to="/events" color="secondary">
          Voir mes évènements
        </Button>
      </Stack>
    </Box>
  )
}
