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
import { AxiosError } from 'axios';

export type AvatarUpdateButtonProps = {
  firstname: string;
  pictureUrl?: string;
  socials: UserSocialDto[];
};

export const AvatarUpdateButton = ({ pictureUrl, firstname, socials }: AvatarUpdateButtonProps) => {
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    const file = e.target.files[0];

    try {
      const res = await api.user.uploadPicture(file);
      dispatch(updatePictureAction(res.picture_url));
    } catch (e) {
      const error = ((e as AxiosError)?.response?.data as any)?.message;
      addToast({ message: error || "Une erreur s'est produite", variant: 'error' });
    } finally {
      setLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      inputFileRef.current!.value = '';
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
      <input
        ref={inputFileRef}
        type="file"
        hidden
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/tiff, image/tif, image/svg"
        onChange={onFileInputChange}
      />
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
