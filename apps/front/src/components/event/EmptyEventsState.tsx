import type { SxProps, Theme } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Stack, styled, Typography } from '@mui/material'

import EmptyEventsIllustration from '../../assets/illustrations/empty-events.png'

const EmptyStateContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(2),
}))

const IllustrationWrapper = styled(Box)(() => ({
  animation: 'fadeInUp 0.6s ease-out',
  '@keyframes fadeInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}))

const Illustration = styled('img')(({ theme }) => ({
  width: '150px',
  height: '150px',
  [theme.breakpoints.down('sm')]: {
    width: '100px',
    height: '100px',
  },
}))

const EmptyStateTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  textAlign: 'center',
}))

const EmptyStateSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  maxWidth: '400px',
}))

const AddEventButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: '24px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
  '&:hover': {
    boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}))

export type EmptyEventsStateProps = {
  onAddEventClick: () => void
  sx?: SxProps<Theme>
}

export const EmptyEventsState = ({ onAddEventClick, sx }: EmptyEventsStateProps) => {
  return (
    <EmptyStateContainer sx={sx}>
      <IllustrationWrapper>
        <Illustration src={EmptyEventsIllustration} alt="Empty Events" />
      </IllustrationWrapper>

      <Box textAlign="center">
        <EmptyStateTitle>Aucun événement pour le moment</EmptyStateTitle>
        <EmptyStateSubtitle>
          Créez votre premier événement pour commencer à organiser vos échanges de cadeaux et listes de souhaits !
        </EmptyStateSubtitle>
      </Box>

      <AddEventButton variant="contained" color="primary" onClick={() => onAddEventClick()} startIcon={<AddIcon />}>
        Créer un événement
      </AddEventButton>
    </EmptyStateContainer>
  )
}
