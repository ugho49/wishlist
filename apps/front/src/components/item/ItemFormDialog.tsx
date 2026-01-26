import type { TransitionProps } from '@mui/material/transitions'
import type { AddItemForListInputDto, ItemId, UpdateItemInputDto, WishlistId } from '@wishlist/common'
import type React from 'react'
import type { FormEvent } from 'react'
import type { GqlWishlistItem } from '../wishlist/WishlistPage'

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
  useMediaQuery,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi, useToast } from '@wishlist/front-hooks'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { TidyURL } from 'tidy-url'

import { isValidUrl } from '../../utils/router.utils'
import { CharsRemaining } from '../common/CharsRemaining'
import { InputLabel } from '../common/InputLabel'
import { Rating } from '../common/Rating'
import { Subtitle } from '../common/Subtitle'

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

type ModeProps<T> = T extends 'create'
  ? { mode: 'create'; item?: never }
  : T extends 'edit'
    ? { mode: 'edit'; item: GqlWishlistItem }
    : never

export type ItemFormDialogProps = (ModeProps<'create'> | ModeProps<'edit'>) & {
  open: boolean
  wishlistId: WishlistId
  title: string
  handleClose: () => void
}

export const ItemFormDialog = ({ title, open, item, mode, handleClose, wishlistId }: ItemFormDialogProps) => {
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

  const isFullscreen = useMediaQuery(theme => theme.breakpoints.down('md'))

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
    onSuccess: () => {
      addToast({ message: 'Souhait créé avec succès', variant: 'success' })
      void queryClient.invalidateQueries({ queryKey: ['WishlistPage', { wishlistId }] })
      resetForm()
    },
  })

  const { mutateAsync: updateItem, isPending: updateItemPending } = useMutation({
    mutationKey: ['item.update', { id: item?.id }],
    mutationFn: (props: { itemId: ItemId; data: UpdateItemInputDto }) => api.item.update(props.itemId, props.data),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Le souhait à bien été modifié', variant: 'success' })
      void queryClient.invalidateQueries({ queryKey: ['WishlistPage', { wishlistId }] })
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
    setPictureUrl(item.pictureUrl || '')
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
    <Dialog
      fullScreen={isFullscreen}
      fullWidth={!isFullscreen}
      open={open}
      onClose={handleClose}
      slots={{ transition: Transition }}
    >
      <AppBar sx={{ position: 'sticky' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }} variant="h6" component="div">
            {title}
          </Typography>
          <IconButton edge="start" color="inherit" disabled={loading} onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="sm"
        sx={isFullscreen ? { marginBlock: '40px' } : { marginTop: '20px', marginBottom: '40px' }}
      >
        <Subtitle>Renseigner les informations sur le souhait</Subtitle>

        <Stack component="form" onSubmit={onSubmit} noValidate gap={2}>
          <Box>
            <TextField
              label="Titre du souhait"
              required
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={name}
              slotProps={{ htmlInput: { maxLength: 40 } }}
              placeholder="Titre du souhait"
              helperText={<CharsRemaining max={40} value={name} />}
              onChange={e => setName(e.target.value)}
            />
            {/* TODO: suggest to "add size" if it's clothe */}
          </Box>

          <Box>
            <TextField
              label="Détails"
              autoComplete="off"
              disabled={loading}
              fullWidth
              value={description}
              slotProps={{ htmlInput: { maxLength: 120 } }}
              placeholder="Ajouter du détail à votre souhait"
              helperText={<CharsRemaining max={120} value={description} />}
              onChange={e => setDescription(e.target.value)}
            />
            {/* TODO: suggest to "add size" if it's clothe */}
          </Box>

          <Box>
            <TextField
              label="URL"
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
                        // biome-ignore lint/nursery/noFloatingPromises: it's okay to not await here
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
                  // biome-ignore lint/nursery/noFloatingPromises: it's okay to not await here
                  scanUrl(newVal)
                }
                setUrl(newVal)
              }}
            />
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={2}>
            <TextField
              label="URL de photo"
              type="url"
              autoComplete="off"
              disabled={loading || scanUrlLoading}
              sx={{ flexGrow: 1 }}
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

            {pictureUrl && validPictureUrl !== false && (
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
