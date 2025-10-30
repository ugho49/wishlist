import type { EventId } from '@wishlist/common'

import CloseIcon from '@mui/icons-material/Close'
import ForestIcon from '@mui/icons-material/Forest'
import { alpha, Button, IconButton, keyframes, Stack, styled, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'

import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit'

interface SecretSantaSuggestionCardProps {
  eventId: EventId
  onDismiss: () => void
}

const glow = keyframes`
  0% {
    filter: drop-shadow(0 0 4px ${alpha('#66bb6a', 0.6)});
  }
  50% {
    filter: drop-shadow(0 0 8px ${alpha('#66bb6a', 0.8)});
  }
  100% {
    filter: drop-shadow(0 0 4px ${alpha('#66bb6a', 0.6)});
  }
`

const GradientCard = styled(Stack)(({ theme }) => ({
  background: alpha('#f1f8f4', 1),
  border: `2px solid ${alpha('#81c784', 0.3)}`,
  borderRadius: '16px',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha('#81c784', 0.15)} 0%, transparent 50%, ${alpha('#ef5350', 0.08)} 100%)`,
  },
}))

const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  zIndex: 1,
  margin: '0 !important',

  [theme.breakpoints.down('md')]: {
    width: '64px',
    height: '64px',
  },
}))

const StyledIcon = styled(ForestIcon)({
  fontSize: '48px',
  color: '#66bb6a',
})

const ContentStack = styled(Stack)(({ theme }) => ({
  flex: 1,
  gap: '32px',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',

  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
}))

const Title = styled(Typography)({
  color: '#1b5e20',
  fontWeight: 700,
  fontSize: '24px',
  position: 'relative',
  zIndex: 1,
})

const Description = styled(Typography)({
  color: '#1b5e20',
  fontSize: '16px',
  lineHeight: 1.5,
  position: 'relative',
  zIndex: 1,
})

const TextContainer = styled(Stack)({
  flex: 1,
  gap: '12px',
})

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#2e7d32' : '#4caf50',
  color: '#ffffff',
  fontWeight: 600,
  padding: '12px 32px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(46, 125, 50, 0.25)',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  position: 'relative',
  zIndex: 1,
  transition: 'all 0.2s ease-in-out',
  animation: `${glow} 1s ease-in-out infinite`,
  alignSelf: 'flex-end',

  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1b5e20' : '#388e3c',
    boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(0, 0, 0, 0.5)' : '0 6px 16px rgba(46, 125, 50, 0.35)',
  },

  [theme.breakpoints.down('lg')]: {
    padding: '10px 24px',
    alignSelf: 'stretch',
  },
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: alpha('#1b5e20', 0.6),
  zIndex: 2,
  transition: 'all 0.2s ease-in-out',

  '&:hover': {
    color: '#1b5e20',
    backgroundColor: alpha('#1b5e20', 0.08),
  },
}))

export function SecretSantaSuggestionCard({ eventId, onDismiss }: SecretSantaSuggestionCardProps) {
  const navigate = useNavigate()

  const handleCreateSecretSanta = () => {
    void navigate({ to: '/events/$eventId/edit', params: { eventId }, search: { tab: TabValues.secretSanta } })
  }

  return (
    <GradientCard direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'center' }}>
      <CloseButton onClick={onDismiss} aria-label="Fermer la suggestion">
        <CloseIcon />
      </CloseButton>

      <IconContainer>
        <StyledIcon />
      </IconContainer>

      <ContentStack>
        <TextContainer>
          <Title variant="h5">Organisez un Secret Santa !</Title>
          <Description variant="body1">
            Ajoutez de la magie à votre événement en organisant un Secret Santa. Tirez au sort les participants et créez
            des souvenirs inoubliables !
          </Description>
        </TextContainer>
        <ActionButton variant="contained" onClick={handleCreateSecretSanta}>
          Créer un Secret Santa
        </ActionButton>
      </ContentStack>
    </GradientCard>
  )
}
