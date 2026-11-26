import type { ReactNode } from 'react';
import type { AdminWishlistDetail } from '../wishlist.types';

import { zodResolver } from '@hookform/resolvers/zod';
import ListIcon from '@mui/icons-material/List';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import { Avatar, Box, Button, Stack, styled, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { match } from 'ts-pattern';
import z from 'zod';

import {
  rejectionMessage,
  rejectionPattern,
  useAdminRemoveWishlistCoOwnerMutation,
  useAdminRemoveWishlistLogoMutation,
  useAdminUpdateWishlistMutation,
  WishlistMode,
} from '../../../gql';
import { useToast } from '../../../hooks';
import { zodRequiredString } from '../../../utils/validation';
import { AdminSection } from '../../admin/AdminSection';
import { ConfirmButton } from '../../common/ConfirmButton';
import { RouterLink } from '../../common/RouterLink';
import { TextareaMarkdown } from '../../common/TextareaMarkdown';

const FormActions = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'flex-start',
});

const SectionTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  marginBottom: theme.spacing(1.5),
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const ManagementList = styled('ul')(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const ManagementRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[50],
  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
  },
}));

const RowAvatar = styled(Avatar)({
  width: 40,
  height: 40,
});

const RowCopy = styled('div')({
  flex: 1,
  minWidth: 0,
});

const RowLabel = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '0.75rem',
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
}));

const RowValue = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: theme.spacing(1),
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.4,
  color: theme.palette.text.primary,
  overflowWrap: 'anywhere',
}));

const RowHint = styled('span')(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.text.secondary,
}));

type ManagementItemProps = {
  avatar: ReactNode;
  label: string;
  value: ReactNode;
  action?: ReactNode;
};

const ManagementItem = ({ avatar, label, value, action }: ManagementItemProps) => (
  <ManagementRow>
    {avatar}
    <RowCopy>
      <RowLabel>{label}</RowLabel>
      <RowValue>{value}</RowValue>
    </RowCopy>
    {action}
  </ManagementRow>
);

const schema = z.object({
  title: zodRequiredString().max(100, '100 caractères maximum'),
  description: z.string().max(2000, '2000 caractères maximum').optional(),
});

type FormFields = z.infer<typeof schema>;

type AdminWishlistInformationsProps = {
  wishlist: AdminWishlistDetail;
  onChanged: () => void;
};

/** Edit form and management actions (co-owner, logo) of the admin wishlist page. */
export const AdminWishlistInformations = ({ wishlist, onChanged }: AdminWishlistInformationsProps) => {
  const { addToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    values: { title: wishlist.title, description: wishlist.description ?? undefined },
  });

  const { mutateAsync: updateWishlistMutation, isPending: loadingUpdate } = useAdminUpdateWishlistMutation({
    onError: () => addToast({ message: 'Impossible de modifier la liste', variant: 'error' }),
  });

  const { mutateAsync: removeLogoMutation, isPending: loadingRemoveLogo } = useAdminRemoveWishlistLogoMutation({
    onError: () => addToast({ message: 'Impossible de supprimer le logo', variant: 'error' }),
  });

  const { mutateAsync: removeCoOwnerMutation, isPending: loadingRemoveCoOwner } = useAdminRemoveWishlistCoOwnerMutation(
    {
      onError: () => addToast({ message: 'Impossible de retirer le co-propriétaire', variant: 'error' }),
    },
  );

  const loading = loadingUpdate || loadingRemoveLogo || loadingRemoveCoOwner;
  const ownerName = `${wishlist.owner.firstName} ${wishlist.owner.lastName}`;
  const coOwnerName = wishlist.coOwner ? `${wishlist.coOwner.firstName} ${wishlist.coOwner.lastName}` : '';

  const onSubmit = async (formValues: FormFields) => {
    const res = await updateWishlistMutation({
      id: wishlist.id,
      input: {
        title: formValues.title,
        description: formValues.description === '' ? undefined : formValues.description,
      },
    });
    match(res.adminUpdateWishlist)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Liste modifiée avec succès', variant: 'success' });
        onChanged();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const removeLogo = async () => {
    const res = await removeLogoMutation({ id: wishlist.id });
    match(res.adminRemoveWishlistLogo)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Logo supprimé', variant: 'success' });
        onChanged();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  const removeCoOwner = async () => {
    const res = await removeCoOwnerMutation({ id: wishlist.id });
    match(res.adminRemoveWishlistCoOwner)
      .with({ __typename: 'VoidOutput' }, () => {
        addToast({ message: 'Co-propriétaire retiré', variant: 'success' });
        onChanged();
      })
      .with(rejectionPattern, rejection => addToast({ message: rejectionMessage(rejection), variant: 'error' }))
      .exhaustive();
  };

  return (
    <Stack sx={{ gap: 2 }}>
      <AdminSection>
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} sx={{ gap: 3 }}>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                {...field}
                label="Titre"
                autoComplete="off"
                disabled={loading}
                fullWidth
                placeholder="Le titre de la liste"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />

          <Box>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextareaMarkdown
                  label="Description"
                  autoComplete="off"
                  fullWidth
                  maxLength={2000}
                  placeholder="Une petite description ..."
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled={loading}
                />
              )}
            />
          </Box>

          <FormActions>
            <Button
              type="submit"
              variant="contained"
              size="small"
              loading={loadingUpdate}
              loadingPosition="start"
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              Mettre à jour
            </Button>
          </FormActions>
        </Stack>
      </AdminSection>

      <AdminSection>
        <SectionTitle>Gestion</SectionTitle>
        <ManagementList>
          <ManagementItem
            avatar={
              <RowAvatar src={wishlist.owner.pictureUrl ?? undefined}>
                <PersonIcon />
              </RowAvatar>
            }
            label="Propriétaire"
            value={
              <>
                <RouterLink to="/admin/users/$userId" params={{ userId: wishlist.owner.id }}>
                  {ownerName}
                </RouterLink>
                <RowHint>{wishlist.owner.email}</RowHint>
              </>
            }
          />

          <ManagementItem
            avatar={
              <RowAvatar src={wishlist.coOwner?.pictureUrl ?? undefined}>
                <PersonIcon />
              </RowAvatar>
            }
            label="Co-propriétaire"
            value={
              wishlist.coOwner ? (
                <>
                  <RouterLink to="/admin/users/$userId" params={{ userId: wishlist.coOwner.id }}>
                    {coOwnerName}
                  </RouterLink>
                  <RowHint>{wishlist.coOwner.email}</RowHint>
                </>
              ) : (
                <RowHint>
                  {wishlist.mode === WishlistMode.Shared
                    ? 'Aucun'
                    : "Aucun — le mode surprise n'autorise pas de co-propriétaire"}
                </RowHint>
              )
            }
            action={
              wishlist.coOwner ? (
                <ConfirmButton
                  confirmTitle="Retirer le co-propriétaire"
                  confirmText={`${coOwnerName} ne pourra plus gérer cette liste. Continuer ?`}
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={loading}
                  loading={loadingRemoveCoOwner}
                  onClick={() => void removeCoOwner()}
                >
                  Retirer
                </ConfirmButton>
              ) : undefined
            }
          />

          <ManagementItem
            avatar={
              <RowAvatar src={wishlist.logoUrl ?? undefined}>
                <ListIcon />
              </RowAvatar>
            }
            label="Logo"
            value={<RowHint>{wishlist.logoUrl ? 'Logo personnalisé' : 'Aucun logo'}</RowHint>}
            action={
              wishlist.logoUrl ? (
                <ConfirmButton
                  confirmTitle="Supprimer le logo"
                  confirmText="Le logo de cette liste sera supprimé définitivement. Continuer ?"
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={loading}
                  loading={loadingRemoveLogo}
                  onClick={() => void removeLogo()}
                >
                  Supprimer
                </ConfirmButton>
              ) : undefined
            }
          />
        </ManagementList>
      </AdminSection>
    </Stack>
  );
};
