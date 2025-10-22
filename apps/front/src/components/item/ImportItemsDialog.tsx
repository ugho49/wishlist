import type { TransitionProps } from '@mui/material/transitions'
import type { ItemDto, WishlistId } from '@wishlist/common'
import type React from 'react'

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import HistoryIcon from '@mui/icons-material/History'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Slide,
  Stack,
  styled,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApi, useToast } from '@wishlist/front-hooks'
import { forwardRef, useState } from 'react'

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

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  textAlign: 'center',
}))

const EmptyStateIcon = styled(HistoryIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.grey[300],
  marginBottom: theme.spacing(2),
}))

const ItemCard = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

export interface ImportItemsDialogProps {
  open: boolean
  wishlistId: WishlistId
  onClose: () => void
  onComplete: () => void
}

export const ImportItemsDialog = ({ open, wishlistId, onClose, onComplete }: ImportItemsDialogProps) => {
  const { addToast } = useToast()
  const api = useApi()
  const queryClient = useQueryClient()
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())

  const isFullscreen = useMediaQuery(theme => theme.breakpoints.down('md'))

  // Fetch importable items
  const { data: importableItems = [], isLoading } = useQuery({
    queryKey: ['item.importable'],
    queryFn: () => api.item.getImportableItems(),
    enabled: open,
  })

  // Import selected items mutation
  const { mutateAsync: importItems, isPending: isImporting } = useMutation({
    mutationKey: ['item.import', wishlistId],
    mutationFn: async () => {
      const selectedItems = importableItems.filter(item => selectedItemIds.has(item.id))

      // Create each selected item in the new wishlist
      await Promise.all(
        selectedItems.map(item =>
          api.item.create({
            wishlist_id: wishlistId,
            name: item.name,
            description: item.description,
            url: item.url,
            score: item.score,
            picture_url: item.picture_url,
          }),
        ),
      )
    },
    onSuccess: () => {
      addToast({
        message: `${selectedItemIds.size} souhait${selectedItemIds.size > 1 ? 's' : ''} importé${selectedItemIds.size > 1 ? 's' : ''} avec succès`,
        variant: 'success',
      })
      queryClient.invalidateQueries({ queryKey: ['wishlist.getById', wishlistId] })
      onComplete()
    },
    onError: () => {
      addToast({ message: "Erreur lors de l'import des souhaits", variant: 'error' })
    },
  })

  const toggleItemSelection = (itemId: string) => {
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
    <Dialog fullScreen={isFullscreen} open={open} onClose={handleSkip} TransitionComponent={Transition} maxWidth="md" fullWidth>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleSkip} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Importer d'anciennes souhaits
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ paddingY: 3 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" padding={4}>
            <Typography>Chargement...</Typography>
          </Box>
        ) : importableItems.length === 0 ? (
          <EmptyStateContainer>
            <EmptyStateIcon />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun souhait à importer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Vous n'avez pas de souhaits non pris dans vos anciennes listes (événements terminés depuis plus de 2 mois)
            </Typography>
            <Button variant="contained" onClick={handleSkip} sx={{ marginTop: 3 }}>
              Continuer
            </Button>
          </EmptyStateContainer>
        ) : (
          <Stack gap={2}>
            <Alert severity="info" icon={<InfoOutlinedIcon />}>
              Vous avez <strong>{importableItems.length}</strong> souhait{importableItems.length > 1 ? 's' : ''} non
              pris dans vos anciennes listes. Sélectionnez ceux que vous souhaitez importer dans votre nouvelle liste.
            </Alert>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {selectedItemIds.size} souhait{selectedItemIds.size > 1 ? 's' : ''} sélectionné{selectedItemIds.size > 1 ? 's' : ''}
              </Typography>
              <Stack direction="row" gap={1}>
                <Button size="small" onClick={selectAll} disabled={selectedItemIds.size === importableItems.length}>
                  Tout sélectionner
                </Button>
                <Button size="small" onClick={deselectAll} disabled={selectedItemIds.size === 0}>
                  Tout désélectionner
                </Button>
              </Stack>
            </Stack>

            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {importableItems.map(item => {
                const isSelected = selectedItemIds.has(item.id)
                return (
                  <ItemCard key={item.id} disablePadding>
                    <ListItemButton onClick={() => toggleItemSelection(item.id)} sx={{ padding: 2 }}>
                      <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                        sx={{ marginRight: 2 }}
                      />
                      {item.picture_url && (
                        <ListItemAvatar>
                          <Avatar src={item.picture_url} alt={item.name} variant="rounded" sx={{ width: 56, height: 56 }} />
                        </ListItemAvatar>
                      )}
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {item.name}
                            </Typography>
                            {item.score && (
                              <Chip label={`${item.score}/5`} size="small" color="primary" variant="outlined" />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack gap={0.5}>
                            {item.description && (
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {item.description}
                              </Typography>
                            )}
                            {item.url && (
                              <Typography variant="caption" color="primary" noWrap>
                                {item.url}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  </ItemCard>
                )
              })}
            </List>

            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2} paddingTop={2}>
              <Button variant="outlined" onClick={handleSkip}>
                Ignorer
              </Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={isImporting}
                loading={isImporting}
                loadingPosition="start"
                startIcon={<AddIcon />}
              >
                {selectedItemIds.size > 0
                  ? `Importer ${selectedItemIds.size} souhait${selectedItemIds.size > 1 ? 's' : ''}`
                  : 'Continuer'}
              </Button>
            </Stack>
          </Stack>
        )}
      </Container>
    </Dialog>
  )
}
