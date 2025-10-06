import type { DetailedEventDto } from '@wishlist/common'

import { Stack } from '@mui/material'

import { useSecretSanta } from '../../hooks/domain/useSecretSanta'
import { Loader } from '../common/Loader'
import { NoSecretSanta } from '../secret-santa/NoSecretSanta'
import { SecretSanta } from '../secret-santa/SecretSanta'

type EditSecretSantaProps = { event: DetailedEventDto }

export const EditSecretSanta = ({ event }: EditSecretSantaProps) => {
  const { secretSanta, loading } = useSecretSanta(event.id)

  return (
    <Stack marginTop={5}>
      <Loader loading={loading}>
        {secretSanta ? <SecretSanta event={event} secretSanta={secretSanta} /> : <NoSecretSanta eventId={event.id} />}
      </Loader>
    </Stack>
  )
}
