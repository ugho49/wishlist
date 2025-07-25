import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import { alpha, Avatar, Box, Stack, styled } from '@mui/material'

import { useMySecretSantaDraw } from '../../hooks/domain/useMySecretSantaDraw'

const Container = styled(Stack)(({ theme }) => ({
  position: 'relative',
  padding: '20px 24px 20px 56px',
  borderRadius: '12px',
  marginBottom: '24px',
  color: theme.palette.text.primary,
  backgroundColor: alpha('#2f7d31', 0.04),
  border: `1px solid ${alpha('#2f7d31', 0.12)}`,
  fontSize: '16px',
  lineHeight: 1.6,
  fontWeight: 400,
  textAlign: 'left',
  borderLeft: `8px solid #2f7d31`,
}))

const IconWrapper = styled(Box)({
  position: 'absolute',
  left: '16px',
  top: '20px',
  color: '#2f7d31',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
})

const DrawName = styled('div')({
  fontWeight: 'bold',
  fontSize: '16px',
  color: '#2f7d31',
})

const InfoRow = styled(Stack)({
  flexDirection: 'row',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '4px',
})

const InfoText = styled(Box)({
  fontSize: '16px',
})

const StyledAvatar = styled(Avatar)({
  width: '28px',
  height: '28px',
  backgroundColor: '#2f7d31',
})

const DescriptionText = styled(Box)(({ theme }) => ({
  fontSize: '14px',
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
}))

type MySecretSantaDrawProps = {
  eventId: string
}

export const MySecretSantaDraw = ({ eventId }: MySecretSantaDrawProps) => {
  const { mySecretSantaDraw: draw } = useMySecretSantaDraw(eventId)

  if (!draw) {
    return
  }

  return (
    <Container direction="column">
      <IconWrapper>
        <CardGiftcardIcon fontSize="small" />
      </IconWrapper>
      <InfoRow>
        <InfoText>Votre Secret Santa est :</InfoText>
        <StyledAvatar src={draw.user?.picture_url} />
        <DrawName>
          {draw.pending_email ? draw.pending_email : `${draw.user?.firstname} ${draw.user?.lastname}`}
        </DrawName>
      </InfoRow>
      <DescriptionText>Vous devez offrir un cadeau à cette personne lors de l'événement !</DescriptionText>
    </Container>
  )
}
