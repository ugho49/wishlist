import type { LinkProps } from '@mui/material/Link'
import type { LinkProps as TanStackLinkProps } from '@tanstack/react-router'

import { Link } from '@mui/material'
import { Link as TanStackLink } from '@tanstack/react-router'
import { forwardRef } from 'react'

type RouterLinkProps = Omit<TanStackLinkProps & LinkProps, 'href'>

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(function RouterLink(props, ref) {
  const { to, ...other } = props
  return <Link ref={ref} to={to} {...other} component={TanStackLink} />
})
