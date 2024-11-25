import type { Theme } from '@mui/material'
import type { DetailedWishlistDto, ItemDto, MiniUserDto, WishlistId } from '@wishlist/common-types'

import type { RootState } from '../../core'

import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone'
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import RedeemIcon from '@mui/icons-material/Redeem'
import TipsAndUpdatesTwoToneIcon from '@mui/icons-material/TipsAndUpdatesTwoTone'
import { LoadingButton } from '@mui/lab'
import {
  Avatar,
  Box,
  Chip,
  chipClasses,
  ClickAwayListener,
  Fade,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Zoom from '@mui/material/Zoom'
import { makeStyles } from '@mui/styles'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { useApi, useToast } from '../../hooks'
import { Card } from '../common/Card'
import { ConfirmMenuItem } from '../common/ConfirmMenuItem'
import { Rating } from '../common/Rating'
import { ItemFormDialog } from './ItemFormDialog'

export type ItemCardProps = {
  wishlist: {
    id: WishlistId
    ownerId: string
    hideItems: boolean
  }
  item: ItemDto
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    padding: '0',
    color: theme.palette.primary.main,
  },
  container: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    margin: '15px 20px',
  },
  actions: {
    position: 'absolute',
    top: '6px',
    right: '6px',
  },
  name: {
    maxWidth: '100%',
    fontWeight: '500 !important',
    wordWrap: 'break-word',
    textAlign: 'center',
  },
  description: {
    maxWidth: '100%',
    fontWeight: 300,
    wordWrap: 'break-word',
    textAlign: 'center',
  },
  suggested: {
    [`&.${chipClasses.root}`]: {
      fontSize: '0.6rem',
      height: '15px',
    },
  },
  date: {
    fontWeight: 300,
    fontSize: '0.6rem',
    color: theme.palette.grey[600],
  },
  takenBy: {
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
    height: '45px',
    boxShadow: '0 0 1px 0 rgba(87, 113, 149, 0.3), 0 2px 4px -2px rgba(87, 113, 149, 0.5)',
  },
}))

const TakenBy = (props: { user: MiniUserDto }) => {
  const classes = useStyles()
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const { user } = props

  return (
    <Stack alignItems="center" justifyContent="center" gap={2} direction="row" className={classes.takenBy}>
      <Box>Pris par</Box>
      <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
        <Tooltip
          arrow
          open={tooltipOpen}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          slots={{
            transition: Zoom,
          }}
          slotProps={{
            transition: { timeout: 300 },
          }}
          title={
            <Stack alignItems="center" gap={1} padding={1}>
              <Typography color="inherit">{`${user.firstname} ${user.lastname}`}</Typography>
              <Avatar
                src={user.picture_url}
                sx={{
                  height: '100px',
                  width: '100px',
                  bgcolor: user?.picture_url ? 'white' : undefined,
                  color: 'black',
                }}
              >
                {user.firstname?.toUpperCase()?.charAt(0)}
              </Avatar>
            </Stack>
          }
        >
          <Avatar
            onClick={() => setTooltipOpen(prev => !prev)}
            src={user.picture_url}
            sx={{
              cursor: 'pointer',
              height: '32px',
              width: '32px',
              bgcolor: user?.picture_url ? 'white' : undefined,
              color: 'black',
            }}
          >
            {user.firstname?.toUpperCase()?.charAt(0)}
          </Avatar>
        </Tooltip>
      </ClickAwayListener>
    </Stack>
  )
}

const ItemImage = (props: { imageUrl: string | undefined; itemUrl: string | undefined }) => {
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.only('xs'))
  const [modalOpen, setModalOpen] = useState(false)
  const { imageUrl, itemUrl } = props

  return (
    <>
      <Avatar
        onClick={() => setModalOpen(true)}
        src={imageUrl}
        variant="square"
        sx={theme => ({
          cursor: imageUrl ? 'pointer' : 'default',
          height: smallScreen ? '80px' : '120px',
          width: smallScreen ? '80px' : '120px',
          bgcolor: theme.palette.grey[200],
          color: theme.palette.grey[500],
          boxShadow: '0 0 1px 0 rgba(87, 113, 149, 0.3), 0 2px 4px -2px rgba(87, 113, 149, 0.5)',
        })}
      >
        <RedeemIcon fontSize="large" />
      </Avatar>
      {imageUrl && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Fade in={modalOpen}>
            <Stack
              alignItems="center"
              gap={2}
              sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                }}
              >
                <img
                  onClick={() => setModalOpen(false)}
                  src={imageUrl}
                  alt="item"
                  style={{
                    maxWidth: smallScreen ? '80vw' : '60vw',
                    maxHeight: smallScreen ? '80vh' : '60vh',
                  }}
                />
              </Box>

              <Stack direction="row" gap={2}>
                <IconButton
                  aria-label="close"
                  size="large"
                  onClick={() => setModalOpen(false)}
                  sx={theme => ({
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    ':hover': {
                      bgcolor: theme.palette.grey[200],
                    },
                    ':focus': {
                      bgcolor: theme.palette.grey[200],
                    },
                  })}
                >
                  <CloseIcon />
                </IconButton>
                {itemUrl && (
                  <IconButton
                    aria-label="close"
                    href={itemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="large"
                    sx={theme => ({
                      bgcolor: 'background.paper',
                      boxShadow: 24,
                      ':hover': {
                        bgcolor: theme.palette.grey[200],
                      },
                      ':focus': {
                        bgcolor: theme.palette.grey[200],
                      },
                    })}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </Fade>
        </Modal>
      )}
    </>
  )
}

const mapState = (state: RootState) => state.auth.user?.id

export const ItemCard = ({ item, wishlist }: ItemCardProps) => {
  const classes = useStyles()
  const currentUserId = useSelector(mapState)
  const api = useApi()
  const { addToast } = useToast()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [takenBy, setTakenBy] = useState<MiniUserDto | undefined>(item.taken_by)
  const NameProps = item.url ? { component: Link, href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {}
  const isTaken = useMemo(() => takenBy !== undefined, [takenBy])
  const ownerOfTheList = currentUserId === wishlist.ownerId
  const displayCheckButton = !ownerOfTheList || !wishlist.hideItems
  const displayActions = (ownerOfTheList || item.is_suggested) && !isTaken
  const queryClient = useQueryClient()

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
  const closeMenu = () => setAnchorEl(null)

  const { mutateAsync: deleteItem, isPending: deleteItemPending } = useMutation({
    mutationKey: ['item.delete', { id: item.id }],
    mutationFn: () => api.item.delete(item.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: () => {
      addToast({ message: 'Le souhait à bien été supprimé', variant: 'success' })
      queryClient.setQueryData(['wishlist', { id: wishlist.id }], (old: DetailedWishlistDto) => ({
        ...old,
        items: old.items.filter(i => i.id !== item.id),
      }))
    },
  })

  const { mutateAsync: toggleItem, isPending: toggleItemPending } = useMutation({
    mutationKey: ['item.toggle', { id: item.id }],
    mutationFn: () => api.item.toggle(item.id),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSuccess: res => {
      const action = res.taken_by !== undefined ? 'check' : 'uncheck'
      setTakenBy(res.taken_by)

      if (action === 'check') {
        addToast({
          message: (
            <span>
              Vous avez coché : <b>{item.name}</b>
            </span>
          ),
          variant: 'success',
        })
      } else {
        addToast({
          message: (
            <span>
              Le souhait <b>{item.name}</b> est à nouveau disponible
            </span>
          ),
          variant: 'info',
        })
      }
    },
  })

  const loading = useMemo(() => deleteItemPending || toggleItemPending, [deleteItemPending, toggleItemPending])

  return (
    <>
      <Card
        className={clsx(
          classes.card,
          'animated zoomIn faster',
          isTaken && 'selected',
          !displayActions && 'hideActions',
        )}
      >
        {isTaken && <TakenBy user={takenBy!} />}
        <Stack className={classes.container}>
          <Box className={classes.actions}>
            {displayActions && (
              <>
                <IconButton onClick={openMenu}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu id="basic-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                  <MenuItem
                    onClick={() => {
                      closeMenu()
                      setOpenDialog(true)
                    }}
                  >
                    <ListItemIcon>
                      <EditTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText>Modifier</ListItemText>
                  </MenuItem>
                  <ConfirmMenuItem
                    onClick={() => deleteItem()}
                    onCancel={() => closeMenu()}
                    confirmTitle="Supprimer le souhait"
                    confirmText={
                      <span>
                        Êtes-vous sûr de vouloir supprimer le souhait <b>{item.name}</b> ?
                      </span>
                    }
                  >
                    <ListItemIcon>
                      <DeleteForeverTwoToneIcon />
                    </ListItemIcon>
                    <ListItemText>Supprimer</ListItemText>
                  </ConfirmMenuItem>
                </Menu>
              </>
            )}
          </Box>
          <Stack alignItems="center">
            <ItemImage imageUrl={item.picture_url} itemUrl={item.url} />
          </Stack>
          <Stack alignItems="center" marginTop={2} marginBottom={1}>
            <Rating value={item.score} size="small" readOnly />
          </Stack>
          <Stack alignItems="center" justifyContent="center" flexGrow={1}>
            <Box className={classes.name} {...NameProps}>
              {item.name}
            </Box>
            {item.description && (
              <Box marginTop={0.5} className={classes.description}>
                {item.description}
              </Box>
            )}
          </Stack>
          {item.is_suggested && (
            <Stack alignItems="center" marginTop={1.5}>
              <Tooltip title="Ce souhait n'est pas visible du créateur de la liste car il a été suggéré par un utilisateur">
                <Chip
                  className={classes.suggested}
                  icon={<TipsAndUpdatesTwoToneIcon sx={{ fontSize: '0.7rem' }} />}
                  label="Souhait suggéré"
                  color="success"
                  variant="outlined"
                />
              </Tooltip>
            </Stack>
          )}
          {displayCheckButton && (
            <Stack alignItems="center" marginTop={1.5}>
              <LoadingButton
                size="small"
                sx={{ fontSize: '0.75rem', opacity: 0.8 }}
                variant="contained"
                onClick={() => toggleItem()}
                loading={loading}
                disabled={loading || (takenBy?.id !== currentUserId && takenBy?.id !== undefined)}
              >
                {takenBy?.id === currentUserId && takenBy?.id !== undefined && <>Ne plus prendre</>}
                {(takenBy?.id === undefined || takenBy?.id !== currentUserId) && <>Réserver ce cadeau</>}
              </LoadingButton>
            </Stack>
          )}
          <Stack marginTop={1} alignItems="center" className={classes.date}>
            Ajouté {DateTime.fromISO(item.created_at).toRelative()}
          </Stack>
        </Stack>
      </Card>
      <ItemFormDialog
        mode="edit"
        title="Modifier le souhait"
        item={item}
        wishlistId={wishlist.id}
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
      />
    </>
  )
}
