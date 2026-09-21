import type { PropsWithChildren } from 'react';
import type { PageBreadcrumb } from './PageBreadcrumbs';

import { Box, Stack, type StackProps, styled } from '@mui/material';

import { PageBreadcrumbs } from './PageBreadcrumbs';

const TitleRoot = styled(Stack)(() => ({
  alignItems: 'stretch',
  paddingBottom: '20px',
}));

const HeadingRow = styled(Stack)(() => ({
  alignItems: 'center',
  justifyContent: 'center',
}));

const Content = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  fontWeight: 300,
  fontSize: '1.6rem',
  letterSpacing: '.05em',
  margin: 0,
  textAlign: 'center',
}));

export type TitleProps = StackProps & {
  breadcrumbs?: PageBreadcrumb[];
};

export const Title = ({ children, breadcrumbs, ...props }: PropsWithChildren<TitleProps>) => (
  <TitleRoot>
    {breadcrumbs ? <PageBreadcrumbs items={breadcrumbs} /> : null}
    <HeadingRow direction="row" {...props}>
      <Content>{children}</Content>
    </HeadingRow>
  </TitleRoot>
);
