import type { LinkProps } from '@mui/material/Link'
import type { LinkProps as ReactRouterLinkProps } from 'react-router-dom'

import { Link } from '@mui/material'
import { forwardRef } from 'react'
import { Link as ReactRouterLink } from 'react-router-dom'

type RouterLinkProps = Omit<ReactRouterLinkProps & LinkProps, 'href'>

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(function RouterLink(props, ref) {
  // eslint-disable-next-line react/prop-types
  const { to, ...other } = props
  return <Link ref={ref} to={to} {...other} component={ReactRouterLink} />
})
