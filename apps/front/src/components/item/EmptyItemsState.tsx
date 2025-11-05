import type { SxProps, Theme } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { Box, Button, Stack, styled, Typography } from '@mui/material'

import EmptyItemsIllustration from '../../assets/illustrations/empty-items.png'

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

const AddItemButton = styled(Button)(({ theme }) => ({
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

const ImportButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  borderRadius: '24px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  border: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
    transform: 'translateY(-2px)',
  },
  '& .MuiButton-startIcon': {
    animation: 'sparkle 2s ease-in-out infinite',
  },
  '@keyframes sparkle': {
    '0%, 100%': {
      transform: 'scale(1) rotate(0deg)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.2) rotate(180deg)',
      opacity: 0.8,
    },
  },
  transition: 'all 0.3s ease',
}))

export type EmptyItemsStateProps = {
  onAddItem: () => void
  isOwner: boolean
  hasImportableItems?: boolean
  onImportItems?: () => void
  sx?: SxProps<Theme>
}

export const EmptyItemsState = ({
  onAddItem,
  isOwner,
  hasImportableItems = false,
  onImportItems,
  sx,
}: EmptyItemsStateProps) => {
  return (
    <EmptyStateContainer sx={sx}>
      <IllustrationWrapper>
        <Illustration src={EmptyItemsIllustration} alt="Empty Items" />
      </IllustrationWrapper>

      <Box textAlign="center">
        <EmptyStateTitle>Aucun souhait pour le moment</EmptyStateTitle>
        <EmptyStateSubtitle>
          {!isOwner && 'Cette liste ne contient aucun souhait. Vous pouvez suggérer un souhait !'}
          {isOwner && !hasImportableItems && 'Ajoutez votre premier souhait à cette liste et partagez vos envies !'}
          {isOwner && hasImportableItems && "Commencez par importer d'anciens souhaits ou ajoutez-en de nouveaux !"}
        </EmptyStateSubtitle>
      </Box>

      <Stack direction="row" gap={2} flexWrap="wrap" justifyContent="center">
        {isOwner && hasImportableItems && onImportItems && (
          <ImportButton variant="contained" onClick={onImportItems} startIcon={<AutoFixHighIcon />}>
            Importer d'anciens souhaits
          </ImportButton>
        )}

        <AddItemButton variant="contained" color="primary" onClick={onAddItem} startIcon={<AddIcon />}>
          {isOwner ? 'Ajouter un souhait' : 'Suggérer un souhait'}
        </AddItemButton>
      </Stack>
    </EmptyStateContainer>
  )
}
