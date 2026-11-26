import type { PropsWithChildren } from 'react';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Button, type ButtonProps, styled } from '@mui/material';

const ButtonStyled = styled(Button)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  '&:disabled': {
    color: 'white',
    opacity: 0.5,
  },
});

export type ImportButtonProps = PropsWithChildren<ButtonProps>;

export const ImportItemsButton = ({ children, size = 'small', ...props }: ImportButtonProps) => (
  <ButtonStyled startIcon={<AutoFixHighIcon />} size={size} {...props}>
    {children}
  </ButtonStyled>
);
