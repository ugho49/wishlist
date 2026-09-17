import type { DataGridProps, GridValidRowModel } from '@mui/x-data-grid';

import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { frFR } from '@mui/x-data-grid/locales';
import clsx from 'clsx';

const HEADER_HEIGHT = 56;
const ROW_HEIGHT = 52;
const FOOTER_HEIGHT = 52;

const GridRoot = styled('div')(({ theme }) => ({
  width: '100%',
  '&.clickable .MuiDataGrid-row': {
    cursor: 'pointer',
  },
  '&.fill': {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  '& .MuiDataGrid-root': {
    border: 'none',
    backgroundColor: theme.palette.background.paper,
  },
  '&.fill .MuiDataGrid-root': {
    flex: 1,
    height: '100%',
  },
}));

const frenchLocaleText = frFR.components.MuiDataGrid.defaultProps.localeText;

export type AdminDataGridProps<R extends GridValidRowModel> = DataGridProps<R> & {
  clickableRows?: boolean;
  fill?: boolean;
};

function gridHeight(rowCount: number, hideFooter: boolean, loading: boolean) {
  const visibleRows = loading && rowCount === 0 ? 5 : Math.max(rowCount, 1);
  return HEADER_HEIGHT + visibleRows * ROW_HEIGHT + (hideFooter ? 0 : FOOTER_HEIGHT) + 2;
}

export const AdminDataGrid = <R extends GridValidRowModel>({
  clickableRows = false,
  fill = false,
  className,
  localeText,
  hideFooter = false,
  rows,
  loading = false,
  sx,
  ...props
}: AdminDataGridProps<R>) => {
  const rowCount = Array.isArray(rows) ? rows.length : 0;

  return (
    <GridRoot className={clsx(clickableRows && 'clickable', fill && 'fill', className)}>
      <DataGrid
        density="standard"
        disableColumnSelector
        disableMultipleRowSelection
        disableVirtualization
        rowHeight={ROW_HEIGHT}
        isCellEditable={() => false}
        {...props}
        hideFooter={hideFooter}
        rows={rows}
        loading={loading}
        localeText={{ ...frenchLocaleText, ...localeText }}
        sx={{ height: fill ? '100%' : gridHeight(rowCount, hideFooter, loading), ...sx }}
      />
    </GridRoot>
  );
};
