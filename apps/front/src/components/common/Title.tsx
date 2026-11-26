import type { PropsWithChildren } from 'react';
import type { PageBreadcrumb } from './PageBreadcrumbs';

import { Box, Stack, type StackProps, styled } from '@mui/material';

import { brandColors } from '../../theme';
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
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '1.75rem',
  lineHeight: 1.25,
  margin: 0,
  textAlign: 'center',
  '&::after': {
    content: '""',
    display: 'block',
    width: 48,
    height: 4,
    margin: `${theme.spacing(1)} auto 0`,
    borderRadius: 2,
    backgroundColor: brandColors.mist,
  },
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
