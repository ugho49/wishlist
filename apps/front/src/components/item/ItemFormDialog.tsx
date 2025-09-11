import type { TransitionProps } from '@mui/material/transitions'
import type {
  AddItemForListInputDto,
  DetailedWishlistDto,
  ItemDto,
  UpdateItemInputDto,
  WishlistId,
} from '@wishlist/common'
import type { FormEvent } from 'react'

import CameraAltIcon from '@mui/icons-material/CameraAlt'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Link,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi, useToast } from '@wishlist/front-hooks'
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { TidyURL } from 'tidy-url'

import { isValidUrl } from '../../utils/router.utils'
import { CharsRemaining } from '../common/CharsRemaining'
import { InputLabel } from '../common/InputLabel'
import { Rating } from '../common/Rating'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  const { children, ...other } = props
  return <Slide direction="up" ref={ref} {...other} children={children} />
})

type ModeProps<T> = T extends 'create'
  ? { mode: 'create'; item?: never }
  : T extends 'edit'
    ? { mode: 'edit'; item: ItemDto }
    : never

export type ItemFormDialogProps = (ModeProps<'create'> | ModeProps<'edit'>) & {
  open: boolean
  wishlistId: WishlistId
  title: string
  handleClose: () => void
}

export const ItemFormDialog = ({ title, open, item, mode, handleClose, wishlistId }: ItemFormDialogProps) => {
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const { addToast } = useToast()
  const api = useApi()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [pictureUrl, setPictureUrl] = useState('')
  const [validPictureUrl, setValidPictureUrl] = useState<boolean | undefined>(true)
  const [score, setScore] = useState<number | null>(null)
  const [scanUrlLoading, setScanUrlLoading] = useState(false)
  const queryClient = useQueryClient()

  const invalidUrl = url !== '' && !isValidUrl(url)
  const formIsValid =
    name.trim() !== '' && !invalidUrl && ((pictureUrl && validPictureUrl === true) || !pictureUrl) && !scanUrlLoading

  const resetForm = () => {
    setName('')
    setDescription('')
    setUrl('')
    setPictureUrl('')
    setScore(null)
  }

  const { mutateAsync: createItem, isPending: createItemPending } = useMutation({
    mutationKey: ['item.create'],
    mutationFn: (data: AddItemForListInputDto) => api.item.create(data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: newItem => {
      addToast({ message: 'Souhait créé avec succès', variant: 'success' })
      queryClient.setQueryData(['wishlist', { id: wishlistId }], (old: DetailedWishlistDto) => ({
        ...old,
        items: [...old.items, newItem],
      }))
      resetForm()
    },
  })

  const { mutateAsync: updateItem, isPending: updateItemPending } = useMutation({
    mutationKey: ['item.update', { id: item?.id }],
    mutationFn: (props: { itemId: string; data: UpdateItemInputDto }) => api.item.update(props.itemId, props.data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: (_output, props) => {
      const { itemId, data } = props
      addToast({ message: 'Le souhait à bien été modifié', variant: 'success' })
      queryClient.setQueryData(['wishlist', { id: wishlistId }], (old: DetailedWishlistDto) => ({
        ...old,
        items: old.items.map(item => (item.id === itemId ? { ...item, ...data } : item)),
      }))
    },
  })

  const loading = useMemo(() => createItemPending || updateItemPending, [createItemPending, updateItemPending])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const base: UpdateItemInputDto = {
      name,
      description: description === '' ? undefined : description,
      url: url === '' ? undefined : TidyURL.clean(url).url,
      picture_url: pictureUrl === '' ? undefined : pictureUrl,
      score: score === null ? undefined : score,
    }

    if (mode === 'create') {
      await createItem({
        wishlist_id: wishlistId,
        ...base,
      })
    }

    if (mode === 'edit') {
      await updateItem({ itemId: item.id, data: base })
    }

    handleClose()
  }

  useEffect(() => {
    if (!item) return

    setName(item.name)
    setDescription(item.description || '')
    setUrl(item.url || '')
    setPictureUrl(item.picture_url || '')
    setScore(item.score || null)
  }, [item])

  const scanUrl = useCallback(
    async (urlToScan: string) => {
      if (scanUrlLoading) return
      if (!urlToScan) return
      if (!isValidUrl(urlToScan)) return

      setScanUrlLoading(true)

      try {
        const { picture_url } = await api.item.scanUrl({ url: urlToScan })

        if (picture_url) {
          setPictureUrl(picture_url)
        } else {
          setPictureUrl('')
        }
      } catch {
        addToast({ message: "Une erreur s'est produite", variant: 'error' })
      } finally {
        setScanUrlLoading(false)
      }
    },
    [scanUrlLoading],
  )

  return (
    <Dialog fullScreen open={open} onClose={handleClose} slots={{ transition: Transition }}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }} variant="h6" component="div">
            {title}
          </Typography>
          <IconButton edge="start" color="inherit" disabled={loading} onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ marginTop: '40px' }}>
        <Stack component="form" onSubmit={onSubmit} noValidate gap={smallScreen ? 2 : 3}>
          <Box>
            <InputLabel required>Nom</InputLabel>
            <TextField
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={name}
              slotProps={{ htmlInput: { maxLength: 40 } }}
              placeholder="Nom du souhait"
              helperText={<CharsRemaining max={40} value={name} />}
              onChange={e => setName(e.target.value)}
            />
            {/* TODO: suggest to "add size" if it's clothe */}
          </Box>

          <Box>
            <InputLabel>Détails</InputLabel>

            <TextField
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={description}
              slotProps={{ htmlInput: { maxLength: 60 } }}
              placeholder="Ajouter du détail à votre souhait"
              helperText={<CharsRemaining max={60} value={description} />}
              onChange={e => setDescription(e.target.value)}
            />
            {/* TODO: suggest to "add size" if it's clothe */}
          </Box>

          <Box>
            <InputLabel>URL</InputLabel>

            <TextField
              type="url"
              autoComplete="off"
              disabled={loading || scanUrlLoading}
              fullWidth
              value={url}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              placeholder="Ex: https://www.google.com"
              error={invalidUrl}
              helperText={
                <>
                  {invalidUrl && <span>L'url saisie n'est pas valide</span>}
                  {!invalidUrl && url && (
                    <Link
                      variant="body1"
                      component="button"
                      disabled={loading || scanUrlLoading}
                      onClick={e => {
                        e.preventDefault()
                        scanUrl(url)
                      }}
                    >
                      Scanner l'url
                    </Link>
                  )}
                </>
              }
              onChange={e => {
                const newVal = e.target.value
                if (pictureUrl === '' && url === '') {
                  scanUrl(newVal)
                }
                setUrl(newVal)
              }}
            />
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={2}>
            <Box sx={{ flexGrow: 1 }}>
              <InputLabel>URL de photo</InputLabel>

              <TextField
                type="url"
                autoComplete="off"
                disabled={loading || scanUrlLoading}
                fullWidth
                value={pictureUrl}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
                placeholder="Ex: https://www.google.com"
                error={validPictureUrl === false}
                helperText={
                  <>
                    {validPictureUrl === false && <span>L'url saisie ne contient pas une image</span>}
                    {validPictureUrl === true && <CharsRemaining max={1000} value={pictureUrl} />}
                  </>
                }
                onChange={e => {
                  setValidPictureUrl(undefined)
                  setPictureUrl(e.target.value)
                }}
              />
            </Box>

            {pictureUrl && validPictureUrl !== false && (
              <Box>
                <InputLabel sx={{ visibility: 'hidden' }}>Preview</InputLabel>

                <Avatar
                  src={pictureUrl}
                  variant="square"
                  sx={{
                    height: '56px',
                    width: '56px',
                  }}
                  onLoad={() => setValidPictureUrl(true)}
                  onError={() => setValidPictureUrl(false)}
                >
                  <CameraAltIcon fontSize="small" />
                </Avatar>
              </Box>
            )}
          </Stack>

          <Box>
            <InputLabel>Niveau de préférence</InputLabel>

            <Rating value={score} disabled={loading} onChange={(_, value) => setScore(value)} size="large" />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            color="primary"
            loading={loading}
            loadingPosition="start"
            disabled={loading || !formIsValid}
            startIcon={<SaveIcon />}
          >
            {mode === 'create' ? 'Ajouter' : 'Modifier'}
          </Button>
        </Stack>
      </Container>
    </Dialog>
  )
}
