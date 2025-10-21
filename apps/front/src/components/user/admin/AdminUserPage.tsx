import type { UserId } from '@wishlist/common'
import type { FormEvent } from 'react'
import type { RootState } from '../../../core'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HistoryIcon from '@mui/icons-material/History'
import LanguageIcon from '@mui/icons-material/Language'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Stack, TextField } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { useApi, useToast } from '../../../hooks'
import { Card } from '../../common/Card'
import { CharsRemaining } from '../../common/CharsRemaining'
import { ConfirmButton } from '../../common/ConfirmButton'
import { WishlistDatePicker } from '../../common/DatePicker'
import { Loader } from '../../common/Loader'
import { Subtitle } from '../../common/Subtitle'
import { Title } from '../../common/Title'
import { AdminListEvents } from '../../event/admin/AdminListEvents'
import { AdminListWishlistsForUser } from '../../wishlist/admin/AdminListWishlistsForUser'
import { AvatarUpdateButton } from '../AvatarUpdateButton'
import { UpdatePasswordModal } from './UpdatePasswordModal'

const mapState = (state: RootState) => state.auth

const UserNameAndEmail = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  marginBottom: theme.spacing(5),
}))

const Name = styled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: '1.3rem',
  color: theme.palette.text.primary,
}))

const Email = styled('div')(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}))

const CardStack = styled(Stack)(() => ({
  gap: 32,
}))

export const AdminUserPage = () => {
  const { addToast } = useToast()
  const { user: currentUser } = useSelector(mapState)
  const params = useParams<'userId'>()
  const userId = (params.userId || '') as UserId
  const { admin: api } = useApi()
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [pictureUrl, setPictureUrl] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [birthday, setBirthday] = useState<DateTime | null>(null)
  const [updatePasswordModalOpen, setUpdatePasswordModalOpen] = useState(false)

  const { data: value, isLoading: loadingUser } = useQuery({
    queryKey: ['admin', 'user', { id: userId }],
    queryFn: ({ signal }) => api.user.getById(userId, { signal }),
  })

  const isCurrentUser = currentUser?.id === userId

  useEffect(() => {
    if (value) {
      setEmail(value.email)
      setFirstname(value.firstname)
      setLastname(value.lastname)
      setBirthday(value?.birthday ? DateTime.fromISO(value.birthday) : null)
      setEnabled(value.is_enabled)
      setPictureUrl(value.picture_url || '')
    }
  }, [value])

  const disableUser = async () => {
    setLoading(true)
    setEnabled(false)
    try {
      // TODO: useMutation
      await api.user.update(userId, { is_enabled: false })
      addToast({ message: 'Utilisateur désactivé', variant: 'success' })
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const enableUser = async () => {
    setLoading(true)
    setEnabled(true)
    try {
      // TODO: useMutation
      await api.user.update(userId, { is_enabled: true })
      addToast({ message: 'Utilisateur activé', variant: 'success' })
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: useMutation
      await api.user.update(userId, {
        firstname,
        lastname,
        birthday: birthday !== null ? new Date(birthday.toISODate() || '') : undefined,
        email,
      })

      addToast({ message: 'Profil mis à jour', variant: 'success' })
    } catch {
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Loader loading={loadingUser}>
      <Title smallMarginBottom>Editer l'utilisateur</Title>

      <UpdatePasswordModal
        userId={userId}
        open={updatePasswordModalOpen}
        onClose={() => setUpdatePasswordModalOpen(false)}
      />

      <Stack direction="row" justifyContent="center" flexWrap="wrap" mb={2}>
        <AvatarUpdateButton
          size="120px"
          pictureUrl={pictureUrl}
          socials={[]}
          onPictureUpdated={url => setPictureUrl(url || '')}
          uploadPictureHandler={file => api.user.uploadPicture(userId, file)}
          updatePictureFromSocialHandler={() => Promise.resolve()}
          deletePictureHandler={() => api.user.deletePicture(userId)}
        />
      </Stack>

      <UserNameAndEmail>
        <Name>
          {firstname} {lastname}
        </Name>
        <Email>{email}</Email>
      </UserNameAndEmail>

      <CardStack>
        <Card>
          <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Inscrit le"
                  secondary={DateTime.fromISO(value?.created_at || '').toLocaleString(
                    DateTime.DATETIME_MED_WITH_SECONDS,
                  )}
                />
              </ListItem>
            </List>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dernière connexion le"
                  secondary={
                    value?.last_connected_at
                      ? DateTime.fromISO(value.last_connected_at).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)
                      : ' - '
                  }
                />
              </ListItem>
            </List>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary="Dernière IP connue" secondary={value?.last_ip || ' - '} />
              </ListItem>
            </List>
          </Stack>

          {!isCurrentUser && (
            <Stack mt="16px" direction="row" justifyContent="center" gap={1} flexWrap="wrap">
              <ConfirmButton
                sx={{ padding: '3px 10px' }}
                confirmTitle={enabled ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                confirmText={
                  enabled
                    ? 'Êtes-vous sûr de vouloir désactiver cet utilisateur ?'
                    : 'Êtes-vous sûr de vouloir activer cet utilisateur ?'
                }
                onClick={() => (enabled ? disableUser() : enableUser())}
                disabled={loading}
                size="small"
                variant="outlined"
                color={enabled ? 'error' : 'success'}
              >
                {enabled ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
              </ConfirmButton>

              <Button
                sx={{ padding: '3px 10px' }}
                variant="outlined"
                size="small"
                disabled={loading}
                onClick={() => setUpdatePasswordModalOpen(true)}
              >
                Changer le mot de passe
              </Button>
            </Stack>
          )}
        </Card>

        <Card>
          <Subtitle>Modifier les informations</Subtitle>

          <Stack component="form" gap={3} onSubmit={updateProfile}>
            <Stack direction="row" flexWrap="wrap" gap={3}>
              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <TextField
                  autoComplete="off"
                  label="Prénom"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={firstname}
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                  placeholder="John"
                  required
                  helperText={<CharsRemaining max={50} value={firstname} />}
                  onChange={e => setFirstname(e.target.value)}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <TextField
                  autoComplete="off"
                  label="Nom"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={lastname}
                  slotProps={{ htmlInput: { maxLength: 50 } }}
                  placeholder="Doe"
                  required
                  helperText={<CharsRemaining max={50} value={lastname} />}
                  onChange={e => setLastname(e.target.value)}
                />
              </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={3}>
              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="off"
                  disabled={loading || isCurrentUser}
                  fullWidth
                  value={email}
                  placeholder="john@doe.fr"
                  required
                  onChange={e => setEmail(e.target.value)}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: '200px' }}>
                <WishlistDatePicker
                  label="Date de naissance"
                  value={birthday}
                  disabled={loading || isCurrentUser}
                  onChange={date => setBirthday(date)}
                  disableFuture
                  fullWidth
                />
              </Box>
            </Stack>

            {!isCurrentUser && (
              <Stack direction="row" justifyContent="center">
                <Button
                  sx={{ marginTop: '8px' }}
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={loading}
                  loadingPosition="start"
                  disabled={loading || isCurrentUser}
                  startIcon={<SaveIcon />}
                >
                  Mettre à jour
                </Button>
              </Stack>
            )}
          </Stack>
        </Card>

        <Card>
          <Subtitle>Evènements</Subtitle>
          <AdminListEvents userId={userId} />
        </Card>

        <Card>
          <Subtitle>Wishlists</Subtitle>
          <AdminListWishlistsForUser userId={userId} />
        </Card>
      </CardStack>
    </Loader>
  )
}
