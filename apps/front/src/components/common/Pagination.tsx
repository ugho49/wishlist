import React, { useMemo } from 'react';
import { Pagination as MuiPagination } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  pagination: {
    marginTop: '30px',
    '& > *': {
      justifyContent: 'center',
      display: 'flex',
    },
  },
}));

export type PaginationProps = {
  totalPage?: number;
  currentPage?: number;
  disabled?: boolean;
  hide?: boolean;
  onChange: (newPage: number) => void;
};

export const Pagination = (props: PaginationProps) => {
  const classes = useStyles();
  const totalPage = useMemo(() => props.totalPage || 1, [props.totalPage]);
  const currentPage = useMemo(() => props.currentPage || 1, [props.currentPage]);

  if (props.hide) return null;

  return (
    <div className={classes.pagination}>
      <MuiPagination
        count={totalPage}
        page={currentPage}
        color="primary"
        disabled={props.disabled}
        size="large"
        onChange={(_, value) => props.onChange(value)}
      />
    </div>
  );
};
