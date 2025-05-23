/// <reference types="vite-plugin-svgr/client" />
import { Container, Stack, styled } from '@mui/material'
import { Outlet } from 'react-router-dom'

import IconSvg from '../../../assets/icons/icon.svg?react'
import TextSvg from '../../../assets/icons/logo_text.svg?react'

const Root = styled(Stack)({
  marginTop: '64px',
})

const Logo = styled(Stack)(({ theme }) => ({
  marginBottom: '25px',
  color: theme.palette.primary.main,
}))

export const AnonymousRouteContainerOutlet = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Root direction="column" alignItems="center">
        <Logo alignItems="center">
          <IconSvg style={{ marginRight: '10px', height: '55px' }} />
          <TextSvg style={{ height: '60px' }} />
        </Logo>
        <Outlet />
      </Root>
    </Container>
  )
}
