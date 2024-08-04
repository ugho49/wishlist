import { Link } from '@mui/material'
import { LinkProps } from '@mui/material/Link/Link'
import { forwardRef } from 'react'
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom'

type RouterLinkProps = Omit<ReactRouterLinkProps & LinkProps, 'href'>

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(function RouterLink(props, ref) {
  // eslint-disable-next-line react/prop-types
  const { to, ...other } = props
  return <Link ref={ref} to={to} {...other} component={ReactRouterLink} />
})
