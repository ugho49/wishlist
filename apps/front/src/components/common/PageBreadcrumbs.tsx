import type { EventId, WishlistId } from '@wishlist/common';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Breadcrumbs, styled } from '@mui/material';

import { RouterLink } from './RouterLink';

type StaticBreadcrumbTo = '/admin' | '/admin/users' | '/admin/events' | '/events' | '/wishlists';

export type PageBreadcrumb =
  | {
      label: string;
      to?: undefined;
    }
  | {
      label: string;
      to: StaticBreadcrumbTo;
    }
  | {
      label: string;
      to: '/events/$eventId';
      params: { eventId: EventId };
    }
  | {
      label: string;
      to: '/wishlists/$wishlistId';
      params: { wishlistId: WishlistId };
      search?: { fromEvent: EventId };
    };

type PageBreadcrumbsProps = {
  items: PageBreadcrumb[];
};

const BreadcrumbsStyled = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiBreadcrumbs-separator': {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}));

const CrumbText = styled('span')(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const CurrentCrumb = styled('span')(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.primary,
  fontWeight: 500,
}));

const CrumbLink = ({ crumb }: { crumb: Exclude<PageBreadcrumb, { to?: undefined }> }) => {
  const content = <CrumbText>{crumb.label}</CrumbText>;

  switch (crumb.to) {
    case '/events/$eventId':
      return (
        <RouterLink
          to="/events/$eventId"
          params={crumb.params}
          activeOptions={{ exact: true }}
          underline="hover"
          color="inherit"
        >
          {content}
        </RouterLink>
      );
    case '/wishlists/$wishlistId':
      return (
        <RouterLink
          to="/wishlists/$wishlistId"
          params={crumb.params}
          search={crumb.search}
          activeOptions={{ exact: true }}
          underline="hover"
          color="inherit"
        >
          {content}
        </RouterLink>
      );
    default:
      return (
        <RouterLink to={crumb.to} activeOptions={{ exact: true }} underline="hover" color="inherit">
          {content}
        </RouterLink>
      );
  }
};

export const PageBreadcrumbs = ({ items }: PageBreadcrumbsProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <BreadcrumbsStyled separator={<NavigateNextIcon fontSize="small" />} aria-label="Fil d'ariane">
      {items.map((crumb, index) => {
        const isLast = index === items.length - 1;
        const key = `${crumb.to ?? 'current'}-${crumb.label}`;
        if (isLast || !crumb.to) {
          return <CurrentCrumb key={key}>{crumb.label}</CurrentCrumb>;
        }
        return <CrumbLink key={key} crumb={crumb} />;
      })}
    </BreadcrumbsStyled>
  );
};
