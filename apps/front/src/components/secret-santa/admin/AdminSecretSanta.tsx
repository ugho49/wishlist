import type { SecretSantaDto, SecretSantaUserId, UpdateSecretSantaInputDto } from '@wishlist/common'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import InfoIcon from '@mui/icons-material/Info'
import NumbersIcon from '@mui/icons-material/Numbers'
import ShortTextIcon from '@mui/icons-material/ShortText'
import TuneIcon from '@mui/icons-material/Tune'
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { SecretSantaStatus } from '@wishlist/common'
import { DateTime } from 'luxon'
import { useState } from 'react'

import { eurosFormatter } from '../../../utils/currency.utils'
import { BreaklineText } from '../../common/BreaklineText'
import { ConfirmButton } from '../../common/ConfirmButton'
import { ConfirmIconButton } from '../../common/ConfirmIconButton'
import { EditSecretSantaFormDialog } from '../EditSecretSantaFormDialog'

type AdminSecretSantaProps = {
  secretSanta: SecretSantaDto
  loading?: boolean
  deleteSecretSanta: () => void
  startSecretSanta: () => void
  cancelSecretSanta: () => void
  updateSecretSanta: (input: UpdateSecretSantaInputDto) => void
  removeSecretSantaUser: (secretSantaUserId: SecretSantaUserId) => void
}

export const AdminSecretSanta = ({
  secretSanta,
  loading = false,
  deleteSecretSanta,
  startSecretSanta,
  cancelSecretSanta,
  updateSecretSanta,
  removeSecretSantaUser,
}: AdminSecretSantaProps) => {
  const theme = useTheme()
  const smallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const [openEditModal, setOpenEditModal] = useState(false)

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <EditSecretSantaFormDialog
        title="Modifier le secret santa"
        open={openEditModal}
        saveButtonText="Modifier"
        handleSubmit={input => {
          setOpenEditModal(false)
          void updateSecretSanta(input)
        }}
        handleClose={() => setOpenEditModal(false)}
        input={{ budget: secretSanta.budget, description: secretSanta.description }}
      />
      <Stack direction="row" flexWrap="wrap" gap={smallScreen ? 0 : 3}>
        <List dense sx={{ flexGrow: 1 }}>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Status" secondary={secretSanta.status} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <NumbersIcon />
            </ListItemIcon>
            <ListItemText primary="Nombre de participants" secondary={secretSanta.users.length} />
          </ListItem>
        </List>

        <List dense sx={{ flexGrow: 1 }}>
          <ListItem>
            <ListItemIcon>
              <AccessTimeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Créé le"
              secondary={DateTime.fromISO(secretSanta.created_at || '').toLocaleString(
                DateTime.DATETIME_MED_WITH_SECONDS,
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText
              primary="Budget Max"
              secondary={secretSanta.budget ? eurosFormatter.format(secretSanta.budget) : 'Non défini'}
            />
          </ListItem>
        </List>

        {secretSanta.description && (
          <List dense>
            <ListItem>
              <ListItemIcon>
                <ShortTextIcon />
              </ListItemIcon>
              <ListItemText primary="Description" secondary={<BreaklineText text={secretSanta.description} />} />
            </ListItem>
          </List>
        )}
      </Stack>

      <Stack
        flexDirection="row"
        alignItems="center"
        gap={smallScreen ? 2 : 4}
        flexWrap="wrap"
        justifyContent="flex-end"
        mb={2}
      >
        {secretSanta.status === SecretSantaStatus.CREATED && (
          <>
            <Button
              sx={{ padding: '3px 10px' }}
              variant="contained"
              color="primary"
              size="small"
              startIcon={<TuneIcon fontSize="small" />}
              loading={loading}
              disabled={loading}
              onClick={() => setOpenEditModal(true)}
            >
              Modifier
            </Button>
            <ConfirmButton
              sx={{ padding: '3px 10px' }}
              confirmTitle="Confirmer la suppression du secret santa"
              confirmText="Êtes-vous sûr de vouloir supprimer le secret santa ? Cette action est irréversible."
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteIcon fontSize="small" />}
              loading={loading}
              disabled={loading}
              onClick={() => deleteSecretSanta()}
            >
              Supprimer
            </ConfirmButton>

            <ConfirmButton
              sx={{ padding: '3px 10px' }}
              confirmTitle="Confirmer le lancement du tirage"
              confirmText="Êtes-vous sûr de vouloir lancer le tirage ?"
              variant="contained"
              color="info"
              size="small"
              endIcon={<ArrowRightAltIcon fontSize="small" />}
              loading={loading}
              disabled={loading}
              onClick={() => startSecretSanta()}
            >
              Lancer le tirage
            </ConfirmButton>
          </>
        )}

        {secretSanta.status === SecretSantaStatus.STARTED && (
          <ConfirmButton
            sx={{ padding: '3px 10px' }}
            confirmTitle="Confirmer l'annulation du tirage"
            confirmText="Êtes-vous sûr de vouloir annuler le tirage ? Cette action est irréversible."
            color="warning"
            variant="contained"
            size="small"
            startIcon={<CancelIcon fontSize="small" />}
            loading={loading}
            disabled={loading}
            onClick={() => cancelSecretSanta()}
          >
            Annuler le tirage
          </ConfirmButton>
        )}
      </Stack>
      <DataGrid
        isRowSelectable={() => false}
        density="standard"
        paginationMode="client"
        hideFooter
        disableColumnMenu
        localeText={{
          noRowsLabel: 'Aucun participant',
        }}
        rows={secretSanta.users.map(u => ({
          id: u.id,
          firstname: u.attendee.user?.firstname,
          lastname: u.attendee.user?.lastname,
          email: u.attendee.user?.email ?? u.attendee.pending_email,
          pictureUrl: u.attendee.user?.picture_url,
          exclusions: u.exclusions.length,
        }))}
        columns={[
          {
            field: 'pictureUrl',
            headerName: '',
            sortable: false,
            filterable: false,
            width: 60,
            display: 'flex',
            align: 'center',
            renderCell: ({ row }) => <Avatar src={row.pictureUrl} sx={{ width: '30px', height: '30px' }} />,
          },
          { field: 'firstname', headerName: 'Prénom', width: 170, valueGetter: value => value ?? '-' },
          { field: 'lastname', headerName: 'Nom', width: 170, valueGetter: value => value ?? '-' },
          { field: 'email', headerName: 'Email', minWidth: 250, flex: 1 },
          {
            field: 'id',
            sortable: false,
            filterable: false,
            headerName: 'Actions',
            display: 'flex',
            headerAlign: 'center',
            align: 'center',
            width: 150,
            renderCell: ({ row }) => (
              <>
                <ConfirmIconButton
                  confirmTitle="Supprimer le participant"
                  confirmText="Êtes-vous sûr de vouloir supprimer ce participant ?"
                  onClick={() => removeSecretSantaUser(row.id)}
                  disabled={secretSanta.status !== SecretSantaStatus.CREATED || loading}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </ConfirmIconButton>
              </>
            ),
          },
        ]}
      />
    </div>
  )
}
