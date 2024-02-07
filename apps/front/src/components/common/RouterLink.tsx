import React from 'react';
import { Link as ReactRouterLink, LinkProps as ReactRouterLinkProps } from 'react-router-dom';
import { LinkProps } from '@mui/material/Link/Link';
import { Link } from '@mui/material';

type RouterLinkProps = Omit<ReactRouterLinkProps & LinkProps, 'href'>;

export const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => {
  const { to, ...other } = props;
  return <Link ref={ref} to={to} {...other} component={ReactRouterLink} />;
});
