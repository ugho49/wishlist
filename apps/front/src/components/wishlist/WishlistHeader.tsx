import type { DetailedWishlist } from './wishlist.types';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import { Button, Container, IconButton, styled, Tooltip, useMediaQuery } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';

import { getAvatarUrl } from '../../utils/wishlist.utils';
import { Description } from '../common/Description';
import { PageBreadcrumbs } from '../common/PageBreadcrumbs';
import {
  MetaChip,
  MetaChipButton,
  PageHero,
  PageHeroAbout,
  PageHeroActions,
  PageHeroMedia,
  PageHeroMeta,
  PageHeroTitle,
} from '../common/PageHero';
import { ImportItemsButton } from './ImportItemsButton';
import { WishlistAvatar } from './WishlistAvatar';
import { wishlistBreadcrumbs } from './wishlist-breadcrumbs';

const SquareIconButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  height: 40,
  borderRadius: 12,
  padding: theme.spacing(0, 2),
  backgroundColor: theme.palette.background.paper,
}));

const ImportIconButton = styled(SquareIconButton)({
  border: 'none',
  color: 'white',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
});

export type WishlistHeaderProps = {
  wishlist: DetailedWishlist;
  currentUserCanEdit: boolean;
  isPublic: boolean;
  hasImportableItems: boolean;
  onOpenEventDialog: () => void;
  onOpenImportDialog: () => void;
};

export const WishlistHeader = ({
  wishlist,
  currentUserCanEdit,
  isPublic,
  hasImportableItems,
  onOpenEventDialog,
  onOpenImportDialog,
}: WishlistHeaderProps) => {
  const navigate = useNavigate();
  const isUpSm = useMediaQuery(theme => theme.breakpoints.up('sm'));
  const { fromEvent } = useSearch({ from: '/_authenticated/_with-layout/wishlists/$wishlistId/' });
  const eventsCount = wishlist.events.length;
  const owners = [wishlist.owner, wishlist.coOwner]
    .filter(owner => !!owner)
    .map(owner => `${owner.firstName} ${owner.lastName}`)
    .join(' & ');

  const handleNavigateToEdit = () => {
    void navigate({
      to: '/wishlists/$wishlistId/edit',
      params: { wishlistId: wishlist.id },
      search: fromEvent ? { fromEvent } : {},
    });
  };

  return (
    <Container maxWidth="lg">
      <PageBreadcrumbs items={wishlistBreadcrumbs(wishlist, fromEvent, 'wishlist')} />

      <PageHero>
        <PageHeroMedia className="round">
          <WishlistAvatar
            src={getAvatarUrl({ wishlist, ownerPictureUrl: wishlist.owner.pictureUrl })}
            sx={{ width: { xs: 56, md: 76 }, height: { xs: 56, md: 76 } }}
          />
        </PageHeroMedia>

        <PageHeroTitle>{wishlist.title}</PageHeroTitle>

        <PageHeroMeta>
          <MetaChip>
            <PersonIcon />
            {owners}
          </MetaChip>
          <MetaChipButton type="button" onClick={onOpenEventDialog}>
            <CalendarMonthIcon />
            {eventsCount} {eventsCount > 1 ? 'évènements' : 'évènement'}
          </MetaChipButton>
          {isPublic && (
            <Tooltip title="Tout le monde peut ajouter, cocher ou voir les souhaits cochés, même le créateur de la liste">
              <MetaChip className="success" tabIndex={0}>
                <PublicIcon />
                Liste publique
              </MetaChip>
            </Tooltip>
          )}
        </PageHeroMeta>

        {currentUserCanEdit && (
          <PageHeroActions>
            {hasImportableItems && (
              <Tooltip title="Importer des souhaits d'anciennes listes">
                {isUpSm ? (
                  <ImportItemsButton onClick={onOpenImportDialog} sx={{ height: 40, borderRadius: '12px', px: 2 }}>
                    Importer
                  </ImportItemsButton>
                ) : (
                  <ImportIconButton size="small" onClick={onOpenImportDialog}>
                    <AutoFixHighIcon fontSize="small" />
                  </ImportIconButton>
                )}
              </Tooltip>
            )}
            {isUpSm ? (
              <ActionButton variant="outlined" startIcon={<EditIcon />} onClick={handleNavigateToEdit}>
                Modifier
              </ActionButton>
            ) : (
              <Tooltip title="Modifier la liste">
                <SquareIconButton size="small" color="primary" onClick={handleNavigateToEdit}>
                  <EditIcon fontSize="small" />
                </SquareIconButton>
              </Tooltip>
            )}
          </PageHeroActions>
        )}

        {wishlist.description && (
          <PageHeroAbout>
            <Description text={wishlist.description} variant="plain" />
          </PageHeroAbout>
        )}
      </PageHero>
    </Container>
  );
};
