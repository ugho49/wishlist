import { Avatar, Box, Stack, styled } from '@mui/material'

import { useMySecretSantaDraw } from '../../hooks/domain/useMySecretSantaDraw'

const Container = styled(Stack)(({ theme }) => ({
  textAlign: 'center',
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  color: theme.palette.text.secondary,
  border: `2px solid #2f7d31`,
  backgroundColor: 'rgb(47 125 49 / 5%)',
}))

const DrawName = styled('div')({
  fontWeight: 'bold',
})

type MySecretSantaDrawProps = {
  eventId: string
}

export const MySecretSantaDraw = ({ eventId }: MySecretSantaDrawProps) => {
  const { mySecretSantaDraw: draw } = useMySecretSantaDraw(eventId)

  if (!draw) {
    return
  }

  return (
    <Container direction="column" alignItems="center" gap={1}>
      <Box>Votre Secret Santa est</Box>
      <Stack flexDirection="row" gap={1} alignItems="center">
        <Avatar src={draw.user?.picture_url} sx={{ width: '30px', height: '30px' }} />
        <DrawName>
          {draw.pending_email ? draw.pending_email : `${draw.user?.firstname} ${draw.user?.lastname}`}
        </DrawName>
      </Stack>
    </Container>
  )
}
