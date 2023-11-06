import React, { useRef, useState } from 'react';
import { Avatar, CircularProgress, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import PortraitIcon from '@mui/icons-material/Portrait';
import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import { useApi, useToast } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';
import { useDispatch } from 'react-redux';
import { updatePicture as updatePictureAction } from '../../core/store/features';
import GoogleIcon from '@mui/icons-material/Google';
import { UserSocialDto } from '@wishlist/common-types';
import { AvatarCropperModal } from './AvatarCropperModal';
import { readFileToURL } from '../../utils/images.utils';
import { getRotatedImage } from '../../utils/canvas.utils';
import { getOrientation } from 'get-orientation/browser';

export type AvatarUpdateButtonProps = {
  firstname: string;
  pictureUrl?: string;
  socials: UserSocialDto[];
};

const ORIENTATION_TO_ANGLE = {
  '1': null,
  '2': null,
  '3': 180,
  '4': null,
  '5': null,
  '6': 90,
  '7': null,
  '8': -90,
};

export const AvatarUpdateButton = ({ pictureUrl, firstname, socials }: AvatarUpdateButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const api = useApi(wishlistApiRef);
  const { addToast } = useToast();
  const dispatch = useDispatch();
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElMenu(event.currentTarget);
  const closeMenu = () => setAnchorElMenu(null);

  const removePicture = async () => {
    setLoading(true);
    closeMenu();
    try {
      await api.user.deletePicture();
      dispatch(updatePictureAction(undefined));
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectAPicture = () => {
    closeMenu();
    inputFileRef.current?.click();
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    let imageDataUrl = await readFileToURL(file);

    try {
      // apply rotation if needed
      const orientation = await getOrientation(file);
      const rotation = ORIENTATION_TO_ANGLE[`${orientation}`];
      if (rotation) {
        imageDataUrl = await getRotatedImage(imageDataUrl, rotation);
      }
    } catch (e) {
      console.warn('failed to detect the orientation');
    }

    setImageSrc(imageDataUrl);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    inputFileRef.current!.value = '';
  };

  const uploadProfilePicture = async (file: File) => {
    setLoading(true);

    try {
      const res = await api.user.uploadPicture(file);
      dispatch(updatePictureAction(res.picture_url));
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = (e as any)?.response?.data?.message as string;
      addToast({ message: error || "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateWithSocialPicture = async (social?: UserSocialDto) => {
    closeMenu();

    if (!social) return;

    setLoading(true);

    try {
      await api.user.updatePictureFromSocial(social.id);
      dispatch(updatePictureAction(social.picture_url));
    } catch (e) {
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {imageSrc && (
        <AvatarCropperModal
          imageSrc={imageSrc}
          handleClose={() => setImageSrc(undefined)}
          handleSave={(file) => {
            setImageSrc(undefined);
            uploadProfilePicture(file);
          }}
        />
      )}
      {!loading && (
        <Avatar
          alt={firstname}
          src={pictureUrl}
          onClick={openMenu}
          sx={{ width: '60px', height: '60px', ':hover': { opacity: 0.7, cursor: 'pointer' } }}
        />
      )}
      {loading && (
        <Avatar sx={{ width: '60px', height: '60px' }}>
          <CircularProgress color="inherit" size="18px" thickness={5} />
        </Avatar>
      )}
      <input ref={inputFileRef} type="file" hidden accept="image/*" onChange={onFileInputChange} />
      <Menu anchorEl={anchorElMenu} open={Boolean(anchorElMenu)} onClose={closeMenu}>
        <MenuItem onClick={() => selectAPicture()}>
          <ListItemIcon>
            <PortraitIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mettre à jour la photo de profil</ListItemText>
        </MenuItem>
        {pictureUrl && (
          <MenuItem onClick={() => removePicture()}>
            <ListItemIcon>
              <NoPhotographyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Supprimer la photo</ListItemText>
          </MenuItem>
        )}
        {socials.find((s) => s.social_type === 'google') && (
          <MenuItem onClick={() => updateWithSocialPicture(socials.find((s) => s.social_type === 'google'))}>
            <ListItemIcon>
              <GoogleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Utiliser ma photo google</ListItemText>
            <ListItemIcon sx={{ marginLeft: '50px', justifyContent: 'flex-end' }}>
              <Avatar
                src={socials.find((s) => s.social_type === 'google')?.picture_url}
                sx={{ width: '20px', height: '20px' }}
              />
            </ListItemIcon>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
