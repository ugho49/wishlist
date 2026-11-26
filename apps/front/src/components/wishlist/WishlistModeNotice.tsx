import type { ReactNode } from 'react';

import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Alert } from '@mui/material';

import { WishlistMode } from '../../gql';
import { WISHLIST_MODE_LABELS } from './wishlist-mode';

const NOTICES: Record<WishlistMode, { icon: ReactNode; text: string }> = {
  [WishlistMode.Surprise]: {
    icon: <VisibilityOffOutlinedIcon />,
    text: "vos proches voient votre liste et réservent vos cadeaux. Vous ne verrez ni qui réserve quoi, ni les idées qu'ils ajoutent à votre liste.",
  },
  [WishlistMode.Shared]: {
    icon: <VisibilityOutlinedIcon />,
    text: 'vous voyez qui réserve quoi, comme tous les participants, et vous pouvez ajouter un co-gestionnaire.',
  },
};

export type WishlistModeNoticeProps = {
  mode: WishlistMode;
  /** Reminds that the mode is chosen at creation and cannot change afterwards. */
  locked?: boolean;
};

export const WishlistModeNotice = ({ mode, locked = false }: WishlistModeNoticeProps) => {
  const { icon, text } = NOTICES[mode];

  return (
    <Alert severity="info" icon={icon}>
      <b>{WISHLIST_MODE_LABELS[mode]}</b> : {text}
      {locked ? ' Ce mode est choisi à la création de la liste et ne peut plus être modifié.' : null}
    </Alert>
  );
};
