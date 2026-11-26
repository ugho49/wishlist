import type React from 'react';

import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import { Button, ButtonBase, Stack, styled } from '@mui/material';
import { useRef, useState } from 'react';

import { WishlistMode } from '../../gql';
import { ACCEPT_IMG, sanitizeImgToUrl } from '../../utils/images.utils';
import { getAvatarUrl } from '../../utils/wishlist.utils';
import { AvatarCropperModal } from '../common/AvatarCropperModal';
import { InputLabel } from '../common/InputLabel';
import { WishlistAvatar } from './WishlistAvatar';

const PreviewStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2.5),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `1px dashed ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.grey[50],
}));

const AvatarButtonStyled = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  flexShrink: 0,
  borderRadius: '50%',
  '& .camera-badge': {
    position: 'absolute',
    right: -2,
    bottom: -2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.grey[300]}`,
    transition: 'all 0.2s ease',
    '& svg': {
      fontSize: 16,
    },
  },
  '&:hover .camera-badge, &.Mui-focusVisible .camera-badge': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

const PreviewTextStyled = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 2,
  minWidth: 0,
});

const PreviewTitleStyled = styled('span')(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '1.15rem',
  lineHeight: 1.3,
  color: theme.palette.primary.main,
  overflowWrap: 'anywhere',
}));

const PreviewCaptionStyled = styled('span')(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
}));

const logoCaption = (params: { hasLogo: boolean; mode: WishlistMode }): string => {
  if (params.hasLogo) return 'Image personnalisée';
  // Same fallback as getAvatarUrl: only the lists in surprise mode show the owner's picture
  if (params.mode === WishlistMode.Surprise) return 'Par défaut, votre photo de profil';
  return 'Ajoutez une photo de la personne';
};

export type WishlistPreviewProps = {
  title: string;
  /** Custom logo of the list, if any. */
  logoUrl?: string;
  mode: WishlistMode;
  ownerPictureUrl?: string | null;
  loading: boolean;
  onLogoChange: (file: File) => void | Promise<void>;
  onLogoRemove: () => void | Promise<void>;
};

/**
 * The list as it will show up for the others (title and logo), with the logo picker.
 * Without a custom logo, it shows the same fallback as the list cards and header.
 */
export const WishlistPreview = (props: WishlistPreviewProps) => {
  const { title, logoUrl, mode, ownerPictureUrl, loading, onLogoChange, onLogoRemove } = props;
  const [tmpLogoSrc, setTmpLogoSrc] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = getAvatarUrl({ wishlist: { logoUrl, mode }, ownerPictureUrl });
  const openFilePicker = () => fileInputRef.current?.click();

  const onLogoInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTmpLogoSrc(await sanitizeImgToUrl(file));
    e.target.value = '';
  };

  return (
    <div>
      {!!tmpLogoSrc && (
        <AvatarCropperModal
          imageSrc={tmpLogoSrc}
          handleClose={() => setTmpLogoSrc(undefined)}
          handleSave={async file => {
            setTmpLogoSrc(undefined);
            await onLogoChange(file);
          }}
        />
      )}
      <input ref={fileInputRef} type="file" hidden accept={ACCEPT_IMG} onChange={onLogoInputChange} />

      <InputLabel>Aperçu de la liste</InputLabel>
      <PreviewStyled>
        <AvatarButtonStyled onClick={openFilePicker} disabled={loading} aria-label="Changer l'image de la liste">
          <WishlistAvatar src={avatarUrl} iconSize="large" />
          <span className="camera-badge">
            <CameraAltOutlinedIcon />
          </span>
        </AvatarButtonStyled>

        <PreviewTextStyled>
          <PreviewTitleStyled>{title}</PreviewTitleStyled>
          <PreviewCaptionStyled>{logoCaption({ hasLogo: !!logoUrl, mode })}</PreviewCaptionStyled>
          <Stack direction="row" sx={{ gap: 1, marginTop: 0.5, marginLeft: -1 }}>
            <Button size="small" onClick={openFilePicker} disabled={loading}>
              Changer l'image
            </Button>
            {!!logoUrl && (
              <Button size="small" color="error" onClick={() => onLogoRemove()} disabled={loading}>
                Retirer
              </Button>
            )}
          </Stack>
        </PreviewTextStyled>
      </PreviewStyled>
    </div>
  );
};
