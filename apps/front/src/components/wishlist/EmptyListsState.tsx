import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Stack, styled, Typography } from '@mui/material'

import EmptyWishlistIllustration from '../../assets/illustrations/empty-wishlist.svg?react'

const EmptyStateContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(2),
}))

const IllustrationWrapper = styled(Box)(({ theme }) => ({
  '& svg': {
    width: '200px',
    height: '200px',
    [theme.breakpoints.down('sm')]: {
      width: '150px',
      height: '150px',
    },
  },
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

const AddListButton = styled(Button)(({ theme }) => ({
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

export type EmptyListsStateProps = {
  addListRoute: string
  title: string
  subtitle: string
}

export const EmptyListsState = ({ addListRoute }: EmptyListsStateProps) => {
  return (
    <EmptyStateContainer>
      <IllustrationWrapper>
        <EmptyWishlistIllustration />
      </IllustrationWrapper>

      <Box textAlign="center">
        <EmptyStateTitle>Aucune liste pour le moment</EmptyStateTitle>
        <EmptyStateSubtitle>
          Créez votre première liste de souhaits pour cet événement et partagez vos envies !
        </EmptyStateSubtitle>
      </Box>

      <AddListButton variant="contained" color="primary" href={addListRoute} startIcon={<AddIcon />}>
        Ajouter ma liste
      </AddListButton>
    </EmptyStateContainer>
  )
}
