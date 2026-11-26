import type { ReactNode } from 'react';
import type { MergeCandidate, MergeEvent, MergeProfileField, MergeSelection, MergeWishlist } from './merge-selection';

import MergeTypeIcon from '@mui/icons-material/MergeType';
import { Alert, Avatar, Checkbox, Chip, FormControlLabel, Radio, Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { match } from 'ts-pattern';

import { AdminUserMergeSide } from '../../../../gql';
import { ConfirmButton } from '../../../common/ConfirmButton';
import { getAttendeeRoleLabel } from '../../../event/attendee-role';
import { EventIcon } from '../../../event/EventIcon';
import { UserAccountProviderChip } from '../UserAccountProviderChip';
import { getAccountProviderLabel } from '../user-account-provider';
import {
  getDefaultSelection,
  getEventLockReason,
  getProfileValue,
  getSecretSantaConflicts,
  getSharedEventIds,
  getSourceOnlyEvents,
  highestRole,
  isOwnedByTarget,
  MERGE_PROFILE_FIELDS,
  setAccountSelected,
  setEventSelected,
  setWishlistSelected,
} from './merge-selection';

const PROFILE_LABELS: Record<MergeProfileField, string> = {
  email: 'Email',
  firstName: 'Prénom',
  lastName: 'Nom',
  birthday: 'Date de naissance',
  picture: 'Photo',
};

const Form = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const Block = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const BlockTitle = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const BlockHint = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
}));

const RowList = styled('ul')(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius,
  '& > li + li': {
    borderTop: `1px solid ${theme.palette.grey[200]}`,
  },
}));

const Row = styled('li', { shouldForwardProp: prop => prop !== 'dropped' })<{ dropped?: boolean }>(
  ({ theme, dropped }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 1.5),
    opacity: dropped ? 0.6 : 1,
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  }),
);

const RowBody = styled('div')({
  flex: 1,
  minWidth: 0,
});

const RowTitle = styled('p')(({ theme }) => ({
  margin: 0,
  fontWeight: 500,
  fontSize: '0.875rem',
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(0.75),
}));

const RowMeta = styled('p', { shouldForwardProp: prop => prop !== 'tone' })<{
  tone?: 'default' | 'warning' | 'error';
}>(({ theme, tone = 'default' }) => ({
  margin: 0,
  marginTop: theme.spacing(0.25),
  fontSize: '0.75rem',
  color: match(tone)
    .with('warning', () => theme.palette.warning.dark)
    .with('error', () => theme.palette.error.main)
    .with('default', () => theme.palette.text.secondary)
    .exhaustive(),
}));

const ProfileGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(120px, 160px) minmax(0, 1fr) minmax(0, 1fr)',
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius,
  '& > *': {
    padding: theme.spacing(1, 1.5),
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  },
  '& > *:nth-of-type(n + 4)': {
    borderTop: `1px solid ${theme.palette.grey[200]}`,
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    '& > .profile-label': {
      gridColumn: '1 / -1',
      paddingBottom: 0,
    },
    '& > *:nth-of-type(n + 4)': {
      borderTop: 'none',
    },
    '& > .profile-label:not(:first-of-type)': {
      borderTop: `1px solid ${theme.palette.grey[200]}`,
    },
  },
}));

const ProfileHead = styled('div')(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.palette.text.secondary,
}));

const ProfileLabel = styled('div')(({ theme }) => ({
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const ProfileChoice = styled(FormControlLabel)({
  minWidth: 0,
  maxWidth: '100%',
  marginRight: 0,
  '& .MuiFormControlLabel-label': {
    minWidth: 0,
    overflow: 'hidden',
  },
});

const ProfileValue = styled('span')({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
});

const SmallAvatar = styled(Avatar)({
  width: 32,
  height: 32,
});

const SubmitRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.grey[200]}`,
}));

const SubmitSummary = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
}));

const formatDate = (iso: string) => DateTime.fromISO(iso).toLocaleString(DateTime.DATE_MED);

const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count > 1 ? plural : singular}`;

type AdminMergeUsersFormProps = {
  source: MergeCandidate;
  target: MergeCandidate;
  merging: boolean;
  onMerge: (selection: MergeSelection) => void;
};

export const AdminMergeUsersForm = ({ source, target, merging, onMerge }: AdminMergeUsersFormProps) => {
  const [selection, setSelection] = useState(() => getDefaultSelection(source, target));

  const sharedEventIds = useMemo(() => getSharedEventIds(source, target), [source, target]);
  const sourceOnlyEvents = useMemo(() => getSourceOnlyEvents(source, target), [source, target]);
  const secretSantaConflicts = useMemo(() => getSecretSantaConflicts(source, target), [source, target]);
  const eventTitles = useMemo(
    () => new Map([...source.events, ...target.events].map(event => [event.id, event.title])),
    [source, target],
  );

  const sourceName = `${source.user.firstName} ${source.user.lastName}`;
  const keptEmail = selection.profile.email === AdminUserMergeSide.Source ? source.user.email : target.user.email;
  const droppedWishlists = source.wishlists.filter(
    wishlist => !isOwnedByTarget(wishlist, target) && !selection.wishlistIds.includes(wishlist.id),
  );
  const droppedEvents = sourceOnlyEvents.filter(event => !selection.eventIds.includes(event.id));

  return (
    <Form>
      {secretSantaConflicts.length > 0 ? (
        <Alert severity="error">
          Les deux comptes participent au secret santa de{' '}
          {secretSantaConflicts.map(event => `« ${event.title} »`).join(', ')}. Retirez l'un des deux du secret santa
          avant de fusionner.
        </Alert>
      ) : null}

      <Block aria-labelledby="merge-profile">
        <BlockTitle id="merge-profile">Profil</BlockTitle>
        <BlockHint>Choisissez la valeur à garder pour chaque champ.</BlockHint>
        <ProfileGrid>
          <ProfileHead className="profile-label" />
          <ProfileHead>Compte conservé</ProfileHead>
          <ProfileHead>Compte fusionné</ProfileHead>
          {MERGE_PROFILE_FIELDS.map(field => {
            const identical = getProfileValue(source.user, field) === getProfileValue(target.user, field);
            return [
              <ProfileLabel key={`${field}-label`} className="profile-label">
                {PROFILE_LABELS[field]}
              </ProfileLabel>,
              ...[AdminUserMergeSide.Target, AdminUserMergeSide.Source].map(side => (
                <div key={`${field}-${side}`}>
                  <ProfileChoice
                    disabled={identical || merging}
                    checked={selection.profile[field] === side}
                    onChange={() => setSelection(prev => ({ ...prev, profile: { ...prev.profile, [field]: side } }))}
                    control={
                      <Radio
                        size="small"
                        name={`merge-${field}`}
                        slotProps={{
                          input: {
                            'aria-label': `${PROFILE_LABELS[field]} du compte ${side === AdminUserMergeSide.Source ? 'fusionné' : 'conservé'}`,
                          },
                        }}
                      />
                    }
                    label={
                      <ProfileFieldValue
                        field={field}
                        candidate={side === AdminUserMergeSide.Source ? source : target}
                      />
                    }
                  />
                </div>
              )),
            ];
          })}
        </ProfileGrid>
      </Block>

      <Block aria-labelledby="merge-accounts">
        <BlockTitle id="merge-accounts">Connexions</BlockTitle>
        <BlockHint>
          Les connexions cochées passent sur le compte conservé. La connexion par mot de passe se fera avec l'email
          retenu ({keptEmail}).
        </BlockHint>
        {source.user.accounts.length === 0 ? (
          <BlockHint>Le compte fusionné n'a aucune connexion.</BlockHint>
        ) : (
          <RowList>
            {source.user.accounts.map(account => {
              const selected = selection.accountIds.includes(account.id);
              const targetAccount = target.user.accounts.find(a => a.provider === account.provider);
              const providerLabel = getAccountProviderLabel(account.provider);
              return (
                <Row key={account.id} dropped={!selected}>
                  <Checkbox
                    checked={selected}
                    disabled={merging}
                    onChange={(_, checked) => setSelection(prev => setAccountSelected(prev, account.id, checked))}
                    slotProps={{ input: { 'aria-label': `Garder la connexion ${providerLabel} ${account.email}` } }}
                  />
                  <RowBody>
                    <RowTitle>
                      <UserAccountProviderChip provider={account.provider} />
                      {account.email}
                    </RowTitle>
                    {targetAccount ? (
                      <RowMeta tone={selected ? 'warning' : 'default'}>
                        {selected
                          ? `Remplace la connexion ${providerLabel} du compte conservé (${targetAccount.email})`
                          : `Le compte conservé garde sa connexion ${providerLabel} (${targetAccount.email})`}
                      </RowMeta>
                    ) : (
                      <RowMeta>{selected ? 'Ajoutée au compte conservé' : 'Supprimée avec le compte fusionné'}</RowMeta>
                    )}
                  </RowBody>
                </Row>
              );
            })}
          </RowList>
        )}
      </Block>

      <Block aria-labelledby="merge-events">
        <BlockTitle id="merge-events">Évènements</BlockTitle>
        <BlockHint>
          Les évènements en commun sont toujours fusionnés (le rôle le plus élevé est gardé). Le compte conservé
          participe déjà à {pluralize(target.events.length, 'évènement')}.
        </BlockHint>
        {source.events.length === 0 ? (
          <BlockHint>Le compte fusionné ne participe à aucun évènement.</BlockHint>
        ) : (
          <RowList>
            {source.events.map(event =>
              sharedEventIds.has(event.id) ? (
                <SharedEventRow key={event.id} event={event} targetEvent={target.events.find(e => e.id === event.id)} />
              ) : (
                <SourceEventRow
                  key={event.id}
                  event={event}
                  selected={selection.eventIds.includes(event.id)}
                  lockReason={getEventLockReason(event, selection, source)}
                  disabled={merging}
                  onChange={checked => setSelection(prev => setEventSelected(prev, event.id, checked))}
                />
              ),
            )}
          </RowList>
        )}
      </Block>

      <Block aria-labelledby="merge-wishlists">
        <BlockTitle id="merge-wishlists">Listes</BlockTitle>
        <BlockHint>Une liste non cochée est supprimée avec ses idées (ou perd sa co-gestion).</BlockHint>
        {source.wishlists.length === 0 ? (
          <BlockHint>Le compte fusionné n'a aucune liste.</BlockHint>
        ) : (
          <RowList>
            {source.wishlists.map(wishlist => (
              <WishlistRow
                key={wishlist.id}
                wishlist={wishlist}
                eventTitles={eventTitles}
                ownedByTarget={isOwnedByTarget(wishlist, target)}
                selected={selection.wishlistIds.includes(wishlist.id)}
                disabled={merging}
                onChange={checked =>
                  setSelection(prev => setWishlistSelected(prev, wishlist, checked, sourceOnlyEvents))
                }
              />
            ))}
          </RowList>
        )}
      </Block>

      <Block aria-labelledby="merge-reservations">
        <BlockTitle id="merge-reservations">Réservations</BlockTitle>
        <FormControlLabel
          disabled={source.reservedItemCount === 0 || merging}
          control={
            <Switch
              checked={selection.transferReservations}
              onChange={(_, checked) => setSelection(prev => ({ ...prev, transferReservations: checked }))}
            />
          }
          label={
            source.reservedItemCount === 0
              ? "Le compte fusionné n'a réservé aucune idée"
              : `Transférer ${pluralize(source.reservedItemCount, 'idée réservée', 'idées réservées')}`
          }
        />
        {source.reservedItemCount > 0 ? (
          <BlockHint>Une idée réservée par les deux comptes reste réservée une seule fois.</BlockHint>
        ) : null}
      </Block>

      <SubmitRow>
        <SubmitSummary>
          {sourceName} ({source.user.email}) sera supprimé.
          {droppedEvents.length > 0 ? ` Retiré de ${pluralize(droppedEvents.length, 'évènement')}.` : ''}
          {droppedWishlists.length > 0 ? ` ${pluralize(droppedWishlists.length, 'liste')} non transférée(s).` : ''}
        </SubmitSummary>
        <ConfirmButton
          variant="contained"
          color="error"
          startIcon={<MergeTypeIcon />}
          loading={merging}
          disabled={merging || secretSantaConflicts.length > 0}
          confirmTitle="Fusionner les comptes"
          confirmText={`${sourceName} (${source.user.email}) sera supprimé définitivement après avoir transmis la sélection au compte conservé. Tout ce qui n'est pas coché sera supprimé avec lui. Cette action est irréversible.`}
          confirmButton="Fusionner"
          onClick={() => onMerge(selection)}
        >
          Fusionner
        </ConfirmButton>
      </SubmitRow>
    </Form>
  );
};

const ProfileFieldValue = ({ field, candidate }: { field: MergeProfileField; candidate: MergeCandidate }) => {
  const value = getProfileValue(candidate.user, field);

  return match(field)
    .with('picture', () =>
      value ? (
        <SmallAvatar src={value} alt="" />
      ) : (
        <ProfileValue>
          <i>Aucune</i>
        </ProfileValue>
      ),
    )
    .with('birthday', () => <ProfileValue>{value ? formatDate(value) : <i>Non renseignée</i>}</ProfileValue>)
    .otherwise(() => <ProfileValue title={value ?? undefined}>{value}</ProfileValue>);
};

const EventTitle = ({ event, children }: { event: MergeEvent; children?: ReactNode }) => (
  <RowTitle>
    <EventIcon icon={event.icon ?? undefined} size="small" />
    {event.title}
    <Chip size="small" variant="outlined" label={getAttendeeRoleLabel(event.role)} />
    {event.inSecretSanta ? <Chip size="small" color="secondary" variant="outlined" label="Secret santa" /> : null}
    {children}
  </RowTitle>
);

const SharedEventRow = ({ event, targetEvent }: { event: MergeEvent; targetEvent?: MergeEvent }) => {
  const conflict = event.inSecretSanta && targetEvent?.inSecretSanta;
  const finalRole = targetEvent ? highestRole(event.role, targetEvent.role) : event.role;

  return (
    <Row>
      <Checkbox checked disabled slotProps={{ input: { 'aria-label': `Évènement en commun ${event.title}` } }} />
      <RowBody>
        <EventTitle event={event}>
          <Chip size="small" color="info" label="En commun" />
        </EventTitle>
        <RowMeta tone={conflict ? 'error' : 'default'}>
          {conflict
            ? 'Les deux comptes participent au secret santa : fusion impossible'
            : `${formatDate(event.eventDate)} · rôle final : ${getAttendeeRoleLabel(finalRole)}`}
        </RowMeta>
      </RowBody>
    </Row>
  );
};

const SourceEventRow = ({
  event,
  selected,
  lockReason,
  disabled,
  onChange,
}: {
  event: MergeEvent;
  selected: boolean;
  lockReason?: string;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <Row dropped={!selected}>
    <Checkbox
      checked={selected}
      disabled={disabled || (selected && lockReason !== undefined)}
      onChange={(_, checked) => onChange(checked)}
      slotProps={{ input: { 'aria-label': `Transférer l'évènement ${event.title}` } }}
    />
    <RowBody>
      <EventTitle event={event} />
      <RowMeta>
        {formatDate(event.eventDate)}
        {selected && lockReason ? ` · obligatoire : ${lockReason.toLowerCase()}` : ''}
        {selected ? '' : ' · le compte fusionné en sera retiré'}
      </RowMeta>
    </RowBody>
  </Row>
);

const WishlistRow = ({
  wishlist,
  eventTitles,
  ownedByTarget,
  selected,
  disabled,
  onChange,
}: {
  wishlist: MergeWishlist;
  eventTitles: Map<string, string>;
  ownedByTarget: boolean;
  selected: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const events = wishlist.eventIds.map(id => eventTitles.get(id)).filter(Boolean);
  const status = match({ ownedByTarget, selected, isCoOwner: wishlist.isCoOwner })
    .with({ ownedByTarget: true }, () => 'Appartient déjà au compte conservé')
    .with({ selected: true, isCoOwner: true }, () => 'Le compte conservé devient co-gestionnaire')
    .with({ selected: true }, () => 'Transférée au compte conservé')
    .with({ isCoOwner: true }, () => 'La co-gestion sera retirée')
    .otherwise(() => `Supprimée avec ses ${pluralize(wishlist.itemCount, 'idée')}`);

  return (
    <Row dropped={!selected && !ownedByTarget}>
      <Checkbox
        checked={selected || ownedByTarget}
        disabled={disabled || ownedByTarget}
        onChange={(_, checked) => onChange(checked)}
        slotProps={{ input: { 'aria-label': `Transférer la liste ${wishlist.title}` } }}
      />
      <RowBody>
        <RowTitle>
          {wishlist.title}
          <Chip size="small" variant="outlined" label={pluralize(wishlist.itemCount, 'idée')} />
          {wishlist.isCoOwner ? <Chip size="small" variant="outlined" label="Co-gestion" /> : null}
        </RowTitle>
        <RowMeta tone={!selected && !ownedByTarget && !wishlist.isCoOwner ? 'warning' : 'default'}>
          {status}
          {events.length > 0 ? ` · ${events.join(', ')}` : ''}
        </RowMeta>
      </RowBody>
    </Row>
  );
};
