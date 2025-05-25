import { Pagination as MuiPagination, styled } from '@mui/material'
import { useMemo } from 'react'

const MuiPaginationStyled = styled(MuiPagination)({
  marginTop: '30px',
  '& > *': {
    justifyContent: 'center',
    display: 'flex',
  },
})

export type PaginationProps = {
  totalPage?: number
  currentPage?: number
  disabled?: boolean
  hide?: boolean
  onChange: (newPage: number) => void
}

export const Pagination = (props: PaginationProps) => {
  const totalPage = useMemo(() => props.totalPage || 1, [props.totalPage])
  const currentPage = useMemo(() => props.currentPage || 1, [props.currentPage])

  if (props.hide) return null

  return (
    <MuiPaginationStyled
      count={totalPage}
      page={currentPage}
      color="primary"
      disabled={props.disabled}
      size="large"
      onChange={(_, value) => props.onChange(value)}
    />
  )
}
