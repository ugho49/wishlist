import type { WishlistId } from '@wishlist/common';
import type { RootState } from '../../core/store';
import type { WishlistItem } from '../wishlist/wishlist.types';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RedeemIcon from '@mui/icons-material/Redeem';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import TipsAndUpdatesTwoToneIcon from '@mui/icons-material/TipsAndUpdatesTwoTone';
import { Avatar, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import { rejectionMessage, rejectionPattern, useDeleteItemMutation, useToggleItemMutation } from '../../gql';
import { useToast } from '../../hooks';
import { ConfirmMenuItem } from '../common/ConfirmMenuItem';
import { Rating } from '../common/Rating';
import { ItemFormDialog } from './ItemFormDialog';
import { type ItemTakerDetails, ItemTakersDialog } from './ItemTakersDialog';
import {
  ActionsContainer,
  ActionsMenuContainer,
  ClickableTitle,
  DateContainer,
  ImageGradientOverlay,
  ItemCardStyled,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemImage,
  ItemImageContainer,
  ItemImagePlaceholder,
  ItemTitle,
  RatingBubbleStyled,
  ReleaseButton,
  ReservedAvatarGroup,
  ReservedButton,
  ReservedIndicator,
  SuggestedBadge,
} from './item-card-parts';

export type ItemCardProps = {
  wishlist: {
    id: WishlistId;
    ownerId: string;
    coOwnerId?: string;
    hideItems: boolean;
  };
  item: WishlistItem;
  onImageClick?: () => void;
};

const toTakers = (
  takers: Array<{
    takenAt: string;
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      pictureUrl?: string | null;
    };
  }>,
): ItemTakerDetails[] =>
  takers.map(taker => ({
    id: taker.user.id,
    firstName: taker.user.firstName,
    lastName: taker.user.lastName,
    pictureUrl: taker.user.pictureUrl,
    takenAt: taker.takenAt,
  }));

const mapState = (state: RootState) => state.auth.user?.id;

export const ItemCard = ({ item, wishlist, onImageClick }: ItemCardProps) => {
  const currentUserId = useSelector(mapState);
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [takers, setTakers] = useState<ItemTakerDetails[]>(() => toTakers(item.takers));
  const [takersDialogOpen, setTakersDialogOpen] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const isTaken = takers.length > 0;
  const isOwnerOrCoOwner = currentUserId === wishlist.ownerId || wishlist.coOwnerId === currentUserId;
  const canReserve = !isOwnerOrCoOwner || !wishlist.hideItems;
  const canEdit = (isOwnerOrCoOwner || item.isSuggested) && !isTaken;
  const isReservedByCurrentUser = takers.some(taker => taker.id === currentUserId);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const { mutateAsync: deleteItemMutation, isPending: deleteItemPending } = useDeleteItemMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });
  const deleteItem = async () => {
    const res = await deleteItemMutation({ itemId: item.id });
    match(res.deleteItem)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Le souhait à bien été supprimé', variant: 'success' });
        void queryClient.invalidateQueries({ queryKey: ['WishlistPage', { wishlistId: wishlist.id }] });
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const { mutateAsync: toggleItemMutation, isPending: toggleItemPending } = useToggleItemMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });
  const toggleItem = async () => {
    const res = await toggleItemMutation({ itemId: item.id });
    match(res.toggleItem)
      .with({ __typename: 'ToggleItemOutput' }, output => {
        const nextTakers = toTakers(output.takers);
        const action = nextTakers.some(taker => taker.id === currentUserId) ? 'check' : 'uncheck';
        setTakers(nextTakers);

        if (action === 'check') {
          addToast({
            message:
              nextTakers.length > 1 ? (
                <span>
                  Vous participez à la réservation de <b>{item.name}</b>
                </span>
              ) : (
                <span>
                  Vous avez coché : <b>{item.name}</b>
                </span>
              ),
            variant: 'success',
          });
        } else if (nextTakers.length > 0) {
          addToast({
            message: (
              <span>
                Vous ne participez plus à la réservation de <b>{item.name}</b>
              </span>
            ),
            variant: 'info',
          });
        } else {
          addToast({
            message: (
              <span>
                Le souhait <b>{item.name}</b> est à nouveau disponible
              </span>
            ),
            variant: 'info',
          });
        }
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const loading = useMemo(() => deleteItemPending || toggleItemPending, [deleteItemPending, toggleItemPending]);

  const shouldShowReserveButton = canReserve;

  return (
    <>
      <ItemCardStyled className={clsx(isTaken && 'reserved', isReservedByCurrentUser && 'reserved-by-me')}>
        {/* Suggested badge - hide when item is reserved */}
        {item.isSuggested && !isTaken && (
          <SuggestedBadge icon={<TipsAndUpdatesTwoToneIcon />} label="Suggéré par un utilisateur" size="small" />
        )}

        {/* Actions menu - always visible */}
        {canEdit && (
          <ActionsMenuContainer>
            <IconButton
              onClick={openMenu}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </ActionsMenuContainer>
        )}

        {/* Reserved indicator - elegant and compact */}
        {isTaken && (
          <ReservedIndicator
            isReservedByMe={isReservedByCurrentUser}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`Voir les réservations de ${item.name}`}
            onClick={event => {
              event.stopPropagation();
              setTakersDialogOpen(true);
            }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                setTakersDialogOpen(true);
              }
            }}
          >
            <RedeemIcon sx={{ fontSize: '1rem' }} />
            <span>Réservé</span>
            <ReservedAvatarGroup max={3} spacing="small">
              {takers.map(taker => (
                <Avatar key={taker.id} src={taker.pictureUrl ?? undefined}>
                  {taker.firstName?.toUpperCase()?.charAt(0)}
                </Avatar>
              ))}
            </ReservedAvatarGroup>
          </ReservedIndicator>
        )}

        {/* Item image */}
        <ItemImageContainer className="item-image-container">
          {item.pictureUrl ? (
            <ItemImage onClick={() => onImageClick?.()} src={item.pictureUrl} alt={item.name} />
          ) : (
            <ItemImagePlaceholder>
              <CardGiftcardIcon />
            </ItemImagePlaceholder>
          )}
          <ImageGradientOverlay />

          {/* Rating bubble - bottom-right of image */}
          {item.score && item.score > 0 && (
            <RatingBubbleStyled>
              <Rating value={item.score} size="small" readOnly />
            </RatingBubbleStyled>
          )}
        </ItemImageContainer>

        {/* Item content */}
        <ItemContent
          className="item-content"
          sx={{ cursor: item.url ? 'pointer' : 'default' }}
          onClick={() => item.url && window.open(item.url, '_blank', 'noopener,noreferrer')}
        >
          {/* Title */}
          <ItemTitle>
            {item.url ? (
              <ClickableTitle
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {item.name}
              </ClickableTitle>
            ) : (
              item.name
            )}
          </ItemTitle>

          {/* Description */}
          {item.description && <ItemDescription>{item.description}</ItemDescription>}

          {/* Action buttons - pushed to bottom */}
          <ActionsContainer>
            {/* Reserve button - only show Reserve button in content */}
            {shouldShowReserveButton && !isReservedByCurrentUser && (
              <ReservedButton
                onClick={e => {
                  e.stopPropagation();
                  void toggleItem();
                }}
                disabled={loading}
                startIcon={<RedeemIcon />}
              >
                {isTaken ? 'Participer' : 'Réserver'}
              </ReservedButton>
            )}
          </ActionsContainer>
        </ItemContent>

        {/* Card footer - at the very bottom */}
        <ItemFooter
          className="item-footer"
          style={{ justifyContent: shouldShowReserveButton && isReservedByCurrentUser ? 'space-between' : 'center' }}
        >
          <DateContainer>
            <Typography variant="caption">Ajouté {DateTime.fromISO(item.createdAt).toRelative()}</Typography>
          </DateContainer>

          {/* Release button in footer when item is reserved by current user */}
          {shouldShowReserveButton && isReservedByCurrentUser && (
            <ReleaseButton
              variant="contained"
              size="small"
              onClick={() => toggleItem()}
              disabled={loading}
              startIcon={<RemoveCircleOutlinedIcon />}
            >
              Libérer
            </ReleaseButton>
          )}
        </ItemFooter>
      </ItemCardStyled>

      {/* Actions menu */}
      <Menu id="item-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            closeMenu();
            setDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <EditTwoToneIcon />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <ConfirmMenuItem
          onClick={() => deleteItem()}
          onCancel={() => closeMenu()}
          confirmTitle="Supprimer le souhait"
          confirmText={
            <span>
              Êtes-vous sûr de vouloir supprimer le souhait <b>{item.name}</b> ?
            </span>
          }
        >
          <ListItemIcon>
            <DeleteForeverTwoToneIcon />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </ConfirmMenuItem>
      </Menu>

      {/* Edit dialog */}
      <ItemFormDialog
        mode="edit"
        title="Modifier le souhait"
        item={item}
        wishlistId={wishlist.id}
        open={isDialogOpen}
        handleClose={() => setDialogOpen(false)}
      />

      <ItemTakersDialog
        open={takersDialogOpen}
        handleClose={() => setTakersDialogOpen(false)}
        itemName={item.name}
        takers={takers}
      />
    </>
  );
};
