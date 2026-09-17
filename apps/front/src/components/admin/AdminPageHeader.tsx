import type { ReactNode } from 'react';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Breadcrumbs, styled } from '@mui/material';

import { RouterLink } from '../common/RouterLink';

export type AdminBreadcrumb = {
  label: string;
  to?: '/admin' | '/admin/users' | '/admin/events';
};

export type AdminPageHeaderProps = {
  title: string;
  count?: number;
  breadcrumbs?: AdminBreadcrumb[];
  avatar?: ReactNode;
  chips?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

const HeaderRoot = styled('header')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const BreadcrumbsStyled = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(1),
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

const IdentityRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
  },
}));

const IdentityBody = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
});

const TitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(0.75),
}));

const TitleText = styled('h1')(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.25rem',
  lineHeight: 1.3,
  color: theme.palette.text.primary,
  margin: 0,
}));

const TitleCount = styled('span')(({ theme }) => ({
  fontSize: '0.7em',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  fontVariantNumeric: 'tabular-nums',
  marginLeft: theme.spacing(1),
  '&::before': {
    content: '"·"',
    marginRight: theme.spacing(0.75),
    color: theme.palette.text.disabled,
    fontWeight: 400,
  },
}));

const MetaText = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.25),
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
}));

const ActionsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(0.75),
  marginLeft: 'auto',
  flexShrink: 0,
  '& .MuiButton-root': {
    padding: `${theme.spacing(0.5)} ${theme.spacing(1.25)}`,
    minHeight: 32,
    fontSize: '0.8125rem',
  },
  '& .MuiButton-startIcon': {
    marginLeft: 0,
    marginRight: theme.spacing(0.75),
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    width: '100%',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(0.5),
  },
}));

export const AdminPageHeader = ({ title, count, breadcrumbs, avatar, chips, meta, actions }: AdminPageHeaderProps) => (
  <HeaderRoot>
    {breadcrumbs && breadcrumbs.length > 0 ? (
      <BreadcrumbsStyled separator={<NavigateNextIcon fontSize="small" />} aria-label="Fil d'ariane">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          if (isLast || !crumb.to) {
            return <CurrentCrumb key={`${crumb.label}-${index}`}>{crumb.label}</CurrentCrumb>;
          }
          return (
            <RouterLink key={`${crumb.label}-${index}`} to={crumb.to} underline="hover" color="inherit">
              <CrumbText>{crumb.label}</CrumbText>
            </RouterLink>
          );
        })}
      </BreadcrumbsStyled>
    ) : null}

    <IdentityRow>
      {avatar}
      <IdentityBody>
        <TitleRow>
          <TitleText>
            {title}
            {count === undefined ? null : <TitleCount>{count.toLocaleString('fr-FR')}</TitleCount>}
          </TitleText>
          {chips}
        </TitleRow>
        {meta ? <MetaText>{meta}</MetaText> : null}
      </IdentityBody>
      {actions ? <ActionsRow>{actions}</ActionsRow> : null}
    </IdentityRow>
  </HeaderRoot>
);
