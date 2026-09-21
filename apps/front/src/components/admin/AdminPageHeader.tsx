import type { ReactNode } from 'react';
import type { PageBreadcrumb } from '../common/PageBreadcrumbs';

import { Box, styled } from '@mui/material';

import { PageBreadcrumbs } from '../common/PageBreadcrumbs';

export type AdminPageHeaderProps = {
  title: string;
  count?: number;
  breadcrumbs?: PageBreadcrumb[];
  avatar?: ReactNode;
  chips?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
};

const HeaderRoot = styled('header')(({ theme }) => ({
  marginBottom: theme.spacing(3),
  flexShrink: 0,
}));

const IdentityRow = styled(Box, { shouldForwardProp: prop => prop !== 'hasAvatar' })<{ hasAvatar?: boolean }>(
  ({ theme, hasAvatar }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(hasAvatar ? 2 : 1.5),
    overflow: 'visible',
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  }),
);

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

const TitleText = styled('h1', { shouldForwardProp: prop => prop !== 'hasAvatar' })<{ hasAvatar?: boolean }>(
  ({ theme, hasAvatar }) => ({
    fontWeight: 600,
    fontSize: hasAvatar ? '1.5rem' : '1.25rem',
    lineHeight: 1.3,
    color: theme.palette.text.primary,
    margin: 0,
  }),
);

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
    {breadcrumbs ? <PageBreadcrumbs items={breadcrumbs} /> : null}

    <IdentityRow hasAvatar={Boolean(avatar)}>
      {avatar}
      <IdentityBody>
        <TitleRow>
          <TitleText hasAvatar={Boolean(avatar)}>
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
