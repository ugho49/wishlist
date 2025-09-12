import type { MiniEventDto } from '@wishlist/common'

import { Autocomplete, ListItemAvatar, ListItemText, Stack, TextField } from '@mui/material'
import { MAX_EVENTS_BY_LIST } from '@wishlist/common'
import { DateTime } from 'luxon'

import { EventIcon } from './EventIcon'

export type SearchEventSelectProps = {
  label?: string
  options: MiniEventDto[]
  disabled?: boolean
  loading?: boolean
  error?: boolean
  onChange: (value: MiniEventDto) => void
  excludedEventIds: string[]
}

export const SearchEventSelect = ({
  label,
  excludedEventIds,
  onChange,
  options,
  disabled,
  error = false,
  loading = false,
}: SearchEventSelectProps) => {
  return (
    <Autocomplete
      fullWidth
      clearOnBlur
      loading={loading}
      blurOnSelect={true}
      value={null}
      noOptionsText="Aucun résultat"
      disabled={disabled}
      options={options}
      onChange={(_, value) => {
        if (value) onChange(value)
      }}
      getOptionDisabled={option => excludedEventIds.includes(option.id)}
      getOptionLabel={option => option.title}
      renderOption={(props, option) => (
        <li {...props}>
          <Stack direction="row" gap={2} alignItems="center" sx={{ width: '100%' }}>
            <ListItemAvatar sx={{ minWidth: 'auto' }}>
              <EventIcon icon={option.icon} />
            </ListItemAvatar>
            <ListItemText
              primary={<b>{option.title}</b>}
              secondary={DateTime.fromISO(option.event_date).toLocaleString(DateTime.DATE_MED)}
            />
          </Stack>
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          slotProps={{ htmlInput: { ...params.inputProps } }}
          placeholder="Sélectionner un évènement"
          error={error}
          helperText={`Vous ne pouvez pas séléctionner plus de ${MAX_EVENTS_BY_LIST} évènements auxquels vous souhaitez que cette liste apparaisse`}
        />
      )}
    />
  )
}
