import type { UserSocialId } from '@wishlist/common'
import type { RootState } from '../../core'

import CheckIcon from '@mui/icons-material/Check'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Button, Stack, styled } from '@mui/material'
import { useGoogleLogin } from '@react-oauth/google'
import { useMutation } from '@tanstack/react-query'
import { UserSocialType } from '@wishlist/common'
import { useApi, useToast } from '@wishlist/front-hooks'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { addUserSocial, removeUserSocial } from '../../core/store/features'
import { Card } from '../common/Card'
import { ConfirmButton } from '../common/ConfirmButton'
import { CustomIcon } from '../common/CustomIcon'
import { Loader } from '../common/Loader'
import { Subtitle } from '../common/Subtitle'

const SocialsContainer = styled(Stack)(() => ({
  gap: '20px',
}))

const SectionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[200]}`,
  padding: theme.spacing(2),
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    textAlign: 'center',
  },
}))

const TextContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}))

const SocialTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '1.1rem',
  color: theme.palette.primary.main,
  gap: theme.spacing(1),
}))

const SocialDescription = styled('div')(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.4,
}))

const ButtonWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  marginLeft: 'auto',
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
  },
}))

const ConnectedUserInfo = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}))

const UserAvatar = styled('img')(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: `2px solid ${theme.palette.grey[300]}`,
}))

const UserDetails = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
}))

const UserName = styled('div')(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
}))

const UserEmail = styled('div')(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
}))

const mapState = (state: RootState) => state.userProfile

export const UserTabSocial = () => {
  const api = useApi()
  const userState = useSelector(mapState)
  const [loadingSocial, setLoadingSocial] = useState(false)
  const dispatch = useDispatch()
  const { addToast } = useToast()
  const googleSocial = (userState.social || []).find(s => s.social_type === UserSocialType.GOOGLE)

  const linkGoogle = useGoogleLogin({
    onSuccess: response => linkSocial(response.code),
    onError: () => {
      setLoadingSocial(false)
      addToast({ message: "Une erreur s'est produite", variant: 'error' })
    },
    flow: 'auth-code',
  })

  const { mutateAsync: unlinkSocial } = useMutation({
    mutationKey: ['user.unlinkSocial'],
    mutationFn: (socialId: UserSocialId) => api.user.unlinkSocialAccount(socialId),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSettled: () => setLoadingSocial(false),
    onSuccess: (_, socialId) => {
      dispatch(removeUserSocial(socialId))
      addToast({ message: 'Compte google dissocié avec succès', variant: 'success' })
    },
  })

  const { mutateAsync: linkSocial } = useMutation({
    mutationKey: ['user.linkSocial'],
    mutationFn: (code: string) => api.user.linkSocialWithGoogle({ code }),
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
    onSettled: () => setLoadingSocial(false),
    onSuccess: data => {
      dispatch(addUserSocial(data))
      addToast({ message: 'Compte Google lié avec succès', variant: 'success' })
    },
  })

  return (
    <Card>
      <Loader loading={!userState.isUserLoaded}>
        <Subtitle>Gérer les connexions sociales</Subtitle>

        <SocialsContainer>
          <SectionContainer>
            <TextContainer>
              <SocialTitle>
                <CustomIcon name="google" style={{ width: 24.5, height: 24.5 }} />
                <span>Authentification via Google</span>{' '}
                {googleSocial && <CheckIcon fontSize="small" color="success" />}
              </SocialTitle>
              {googleSocial ? (
                <ConnectedUserInfo>
                  <UserAvatar src={googleSocial.picture_url} alt="Avatar Google" />
                  <UserDetails>
                    <UserName>{googleSocial.name}</UserName>
                    <UserEmail>{googleSocial.email}</UserEmail>
                  </UserDetails>
                </ConnectedUserInfo>
              ) : (
                <SocialDescription>Vous pouvez vous connecter avec votre compte Google.</SocialDescription>
              )}
            </TextContainer>
            <ButtonWrapper>
              {googleSocial ? (
                <ConfirmButton
                  confirmTitle="Dissocier votre compte Google"
                  confirmText="Voulez-vous vraiment dissocier votre compte Google ?"
                  loading={loadingSocial}
                  disabled={loadingSocial}
                  startIcon={<DeleteForeverIcon />}
                  color="error"
                  variant="text"
                  onClick={() => unlinkSocial(googleSocial.id)}
                >
                  Dissocier
                </ConfirmButton>
              ) : (
                <Button
                  loading={loadingSocial}
                  disabled={loadingSocial}
                  variant="contained"
                  onClick={() => {
                    setLoadingSocial(true)
                    linkGoogle()
                  }}
                >
                  Lier votre compte Google
                </Button>
              )}
            </ButtonWrapper>
          </SectionContainer>
        </SocialsContainer>
      </Loader>
    </Card>
  )
}
