import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StraightenIcon from '@mui/icons-material/Straighten';
import { Alert, Stack, styled, Typography } from '@mui/material';

const ProfileCard = styled(Alert)(({ theme }) => ({
  borderRadius: theme.spacing(2),
}));

const Detail = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

export type WishlistOwnerGiftProfileData = {
  clothingSize?: string | null;
  shoeSize?: string | null;
  notes?: string | null;
  address?: {
    line1: string;
    line2?: string | null;
    postalCode: string;
    city: string;
    country: string;
  } | null;
};

export type WishlistOwnerGiftProfileProps = {
  ownerFirstName: string;
  profile: WishlistOwnerGiftProfileData;
};

export const WishlistOwnerGiftProfile = ({ ownerFirstName, profile }: WishlistOwnerGiftProfileProps) => {
  const hasPreferences = Boolean(profile.clothingSize || profile.shoeSize || profile.notes);
  const address = profile.address;
  if (!hasPreferences && !address) return null;

  return (
    <Stack sx={{ gap: 1.5 }}>
      {hasPreferences && (
        <ProfileCard severity="info" icon={<StraightenIcon />}>
          <Typography fontWeight={600} sx={{ mb: 0.5 }}>
            Infos pour offrir à {ownerFirstName}
          </Typography>
          {profile.clothingSize && <Detail>Taille vêtements : {profile.clothingSize}</Detail>}
          {profile.shoeSize && <Detail>Pointure : {profile.shoeSize}</Detail>}
          {profile.notes && <Detail>{profile.notes}</Detail>}
        </ProfileCard>
      )}
      {address && (
        <ProfileCard severity="success" icon={<HomeOutlinedIcon />}>
          <Typography fontWeight={600} sx={{ mb: 0.5 }}>
            Adresse de livraison
          </Typography>
          <Detail>{address.line1}</Detail>
          {address.line2 && <Detail>{address.line2}</Detail>}
          <Detail>
            {address.postalCode} {address.city}
          </Detail>
          <Detail>{address.country}</Detail>
        </ProfileCard>
      )}
    </Stack>
  );
};
