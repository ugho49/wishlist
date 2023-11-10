import { AvatarCropperModal } from '../common/AvatarCropperModal';
import { Avatar, Box, Button, Stack, useTheme } from '@mui/material';
import { InputLabel } from '../common/InputLabel';
import RedeemIcon from '@mui/icons-material/Redeem';
import React, { useState } from 'react';
import { sanitizeImgToUrl } from '../../utils/images.utils';

type WishlistLogoActionsProps = {
  logoUrl?: string;
  loading: boolean;
  onLogoChange: (file: File) => void;
  onLogoRemove: () => void;
};

export const WishlistLogoActions = (props: WishlistLogoActionsProps) => {
  const { logoUrl, loading, onLogoChange, onLogoRemove } = props;
  const theme = useTheme();
  const [tmpLogoSrc, setTmpLogoSrc] = useState<string | undefined>();

  const onLogoInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const imageDataUrl = await sanitizeImgToUrl(file);

    setTmpLogoSrc(imageDataUrl);

    e.target.value = '';
  };

  return (
    <>
      {tmpLogoSrc && (
        <AvatarCropperModal
          imageSrc={tmpLogoSrc}
          handleClose={() => setTmpLogoSrc(undefined)}
          handleSave={(file) => {
            setTmpLogoSrc(undefined);
            onLogoChange(file);
          }}
        />
      )}
      <Box>
        <InputLabel>Logo</InputLabel>
        <Stack direction="row" gap={2}>
          <Avatar src={logoUrl} sx={{ width: 70, height: 70, bgcolor: theme.palette.primary.light }}>
            <RedeemIcon fontSize="large" />
          </Avatar>

          <Stack direction="column" justifyContent="center" gap={1} marginLeft={5}>
            <Box>
              <Button variant="outlined" component="label" disabled={loading} size="small">
                Choisir un logo
                <input type="file" hidden accept="image/*" onChange={onLogoInputChange} />
              </Button>
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                disabled={!logoUrl || loading}
                size="small"
                color="error"
                onClick={() => onLogoRemove()}
              >
                Supprimer le logo
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};
