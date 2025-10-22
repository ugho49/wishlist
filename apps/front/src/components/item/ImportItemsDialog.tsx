import type { TransitionProps } from '@mui/material/transitions'
import type { ItemDto, ItemId, WishlistId } from '@wishlist/common'
import type React from 'react'

import AddIcon from '@mui/icons-material/Add'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Alert,
  AppBar,
  alpha,
  Box,
  Button,
  Dialog,
  IconButton,
  Link,
  Slide,
  Stack,
  styled,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi, useToast } from '@wishlist/front-hooks'
import clsx from 'clsx'
import { forwardRef, useState } from 'react'

import { Card } from '../common/Card'
import { Rating, RatingBubble } from '../common/Rating'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  const { children, ...other } = props
  return (
    <Slide direction="up" ref={ref} {...other}>
      {children}
    </Slide>
  )
})

const ItemCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  boxShadow: 'none',
  transition: 'none',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'none !important',
    boxShadow: 'none !important',
    border: `1px solid ${theme.palette.primary.light}`,
  },
  '&.selected': {
    border: `2px solid ${theme.palette.primary.main}`,
  },
}))

const ItemsListContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  flexGrow: 1,
  overflow: 'auto',
})

const ItemImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100px',
  height: '100px',
  borderRadius: '8px',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
  flexShrink: 0,
  marginRight: theme.spacing(2),
}))

const ItemImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 1,
})

const ItemImagePlaceholder = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '3rem',
    color: theme.palette.primary.main,
    opacity: 0.6,
  },
}))

const ItemTitleContainer = styled(Box)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  color: theme.palette.text.primary,
  lineHeight: 1.4,
}))

const ItemDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontStyle: 'italic',
  lineHeight: 1.4,
}))

const ItemUrl = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.primary.dark,
  },
}))

const ItemContentWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flexGrow: 1,
  minHeight: '100px',
})

const BottomActionStack = styled(Stack)(({ theme }) => ({
  position: 'sticky',
  flexDirection: 'row',
  bottom: 0,
  padding: '12px 24px',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#f9fafb',
}))

export interface ImportItemsDialogProps {
  open: boolean
  wishlistId: WishlistId
  importableItems: ItemDto[]
  onClose: () => void
  onComplete: () => void
}

export const ImportItemsDialog = ({
  open,
  wishlistId,
  onClose,
  onComplete,
  importableItems,
}: ImportItemsDialogProps) => {
  const { addToast } = useToast()
  const api = useApi()
  const queryClient = useQueryClient()
  const [selectedItemIds, setSelectedItemIds] = useState<Set<ItemId>>(new Set())

  const isFullscreen = useMediaQuery(theme => theme.breakpoints.down('md'))

  // Import selected items mutation
  const { mutateAsync: importItems, isPending: isLoading } = useMutation({
    mutationKey: ['item.import', wishlistId],
    mutationFn: () =>
      api.item.importItems({
        wishlist_id: wishlistId,
        source_item_ids: Array.from(selectedItemIds),
      }),
    onSuccess: () => {
      const count = selectedItemIds.size
      const plural = count > 1
      const message = `${count} souhait${plural ? 's' : ''} importé${plural ? 's' : ''} avec succès`

      addToast({ message, variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['wishlist', { id: wishlistId }] })
      queryClient.invalidateQueries({ queryKey: ['item.importable', { wishlistId }] })
      onComplete()
    },
    onError: () => {
      addToast({ message: "Erreur lors de l'import des souhaits", variant: 'error' })
    },
  })

  const toggleItemSelection = (itemId: ItemId) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedItemIds(new Set(importableItems.map(item => item.id)))
  }

  const deselectAll = () => {
    setSelectedItemIds(new Set())
  }

  const handleImport = async () => {
    if (selectedItemIds.size === 0) {
      onClose()
      onComplete()
      return
    }
    await importItems()
  }

  const handleSkip = () => {
    onClose()
    onComplete()
  }

  return (
    <Dialog
      fullScreen={isFullscreen}
      open={open}
      onClose={handleSkip}
      slots={{ transition: Transition }}
      maxWidth="md"
      fullWidth
    >
      <AppBar sx={{ position: 'sticky' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleSkip} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Importer d'anciens souhaits
          </Typography>
        </Toolbar>
      </AppBar>

      <Stack padding={3} gap={2} direction="column" sx={{ backgroundColor: 'rgb(249, 250, 251)' }}>
        <Alert severity="info" icon={<InfoOutlinedIcon />}>
          Vous avez <strong>{importableItems.length}</strong> souhait{importableItems.length > 1 ? 's' : ''} non pris
          dans vos anciennes listes. Sélectionnez ceux que vous souhaitez importer dans votre nouvelle liste.
        </Alert>

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="body2" color="text.secondary">
            {selectedItemIds.size} souhait{selectedItemIds.size > 1 ? 's' : ''} sélectionné
            {selectedItemIds.size > 1 ? 's' : ''}
          </Typography>
          <Stack direction="row" gap={1}>
            <Button
              size="small"
              variant={selectedItemIds.size === 0 ? 'text' : 'outlined'}
              onClick={deselectAll}
              disabled={selectedItemIds.size === 0}
            >
              Tout désélectionner
            </Button>
            <Button
              size="small"
              onClick={selectAll}
              variant={selectedItemIds.size === importableItems.length ? 'text' : 'outlined'}
              disabled={selectedItemIds.size === importableItems.length}
            >
              Tout sélectionner
            </Button>
          </Stack>
        </Stack>

        <ItemsListContainer>
          {importableItems.map(item => (
            <ItemCard
              key={item.id}
              hoverable
              onClick={() => toggleItemSelection(item.id)}
              className={clsx({ selected: selectedItemIds.has(item.id) })}
            >
              <ItemImageContainer>
                {item.picture_url ? (
                  <ItemImage src={item.picture_url} alt={item.name} />
                ) : (
                  <ItemImagePlaceholder>
                    <CardGiftcardIcon />
                  </ItemImagePlaceholder>
                )}
              </ItemImageContainer>

              <ItemContentWrapper>
                <Stack direction="column" gap={1}>
                  <ItemTitleContainer>
                    {item.url ? (
                      <ItemUrl
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                      >
                        {item.name}
                      </ItemUrl>
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </ItemTitleContainer>

                  {item.description && <ItemDescription>{item.description}</ItemDescription>}
                </Stack>

                {item.score && (
                  <RatingBubble>
                    <Rating value={item.score} size="small" readOnly />
                  </RatingBubble>
                )}
              </ItemContentWrapper>
            </ItemCard>
          ))}
        </ItemsListContainer>
      </Stack>

      <BottomActionStack>
        <Button variant="outlined" color="secondary" onClick={handleSkip}>
          Ignorer
        </Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={isLoading}
          loading={isLoading}
          loadingPosition="start"
          startIcon={<AddIcon />}
        >
          {selectedItemIds.size > 0
            ? `Importer ${selectedItemIds.size} souhait${selectedItemIds.size > 1 ? 's' : ''}`
            : 'Continuer'}
        </Button>
      </BottomActionStack>
    </Dialog>
  )
}
