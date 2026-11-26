import type { SxProps, Theme } from '@mui/material';

import { EmptyState } from '../common/EmptyState';

export type EmptyReservedItemsStateProps = {
  title: string;
  subtitle: string;
  sx?: SxProps<Theme>;
};

export const EmptyReservedItemsState = ({ title, subtitle, sx }: EmptyReservedItemsStateProps) => (
  <EmptyState genieVariant="hello" sx={sx} title={title} subtitle={subtitle} />
);
