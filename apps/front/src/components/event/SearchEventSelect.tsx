import React from 'react';
import { MAX_EVENTS_BY_LIST, MiniEventDto } from '@wishlist/common-types';
import { Autocomplete, TextField } from '@mui/material';
import { DateTime } from 'luxon';

export type SearchEventSelectProps = {
  options: MiniEventDto[];
  disabled?: boolean;
  error?: boolean;
  onChange: (value: MiniEventDto) => void;
  excludedEventIds: string[];
};

export const SearchEventSelect = ({
  excludedEventIds,
  onChange,
  options,
  disabled,
  error = false,
}: SearchEventSelectProps) => {
  return (
    <Autocomplete
      fullWidth
      clearOnBlur
      blurOnSelect={true}
      value={null}
      noOptionsText="Aucun résultat"
      disabled={disabled}
      options={options}
      onChange={(_, value) => {
        if (value) onChange(value);
      }}
      getOptionDisabled={(option) => excludedEventIds.includes(option.id)}
      getOptionLabel={(option) =>
        `${option.title} - ${DateTime.fromISO(option.event_date).toLocaleString(DateTime.DATE_MED)}`
      }
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{ ...params.inputProps }}
          placeholder="Sélectionner un évènement"
          error={error}
          helperText={`Vous ne pouvez pas séléctionner plus de ${MAX_EVENTS_BY_LIST} évènements auxquels vous souhaitez que cette liste apparaisse`}
        />
      )}
    />
  );
};
