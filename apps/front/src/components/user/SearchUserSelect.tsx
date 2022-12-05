import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { MiniUserDto } from '@wishlist/common-types';
import { debounce } from 'lodash';
import { useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';

export type SearchUserSelectProps = {
  value?: MiniUserDto;
  disabled?: boolean;
  onChange: (values: MiniUserDto | string) => void;
  excludedEmails: string[];
};

export const SearchUserSelect = ({ disabled, onChange, excludedEmails, value }: SearchUserSelectProps) => {
  const api = useApi(wishlistApiRef);
  const [currentValue, setCurrentValue] = useState<MiniUserDto | null>(value || null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<MiniUserDto[]>([]);

  const searchUser = async (inputValue: string) => {
    setLoading(true);
    try {
      if (inputValue.trim() === '' || inputValue.trim().length < 2) {
        setOptions([]);
        return;
      }
      const users = await api.user.searchUserByKeyword(inputValue);
      setOptions(users);
    } catch (e) {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUserDebounced = debounce(searchUser, 500);

  // TODO: handle create new user

  return (
    <Autocomplete
      fullWidth
      clearOnBlur
      blurOnSelect={true}
      value={currentValue}
      onChange={(_, value) => {
        if (value) onChange(value);
        setCurrentValue(null);
      }}
      disabled={disabled}
      options={options}
      loading={loading}
      loadingText="Chargement..."
      noOptionsText="Aucun résultat"
      filterOptions={(values) => values.filter((opt) => !excludedEmails.includes(opt.email))}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return `${option.firstname} ${option.lastname} (${option.email})`;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputProps={{ ...params.inputProps }}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length > 1) setLoading(true);
            searchUserDebounced(value);
          }}
          label="Rechercher un participant ..."
          helperText="Si vous ne trouvez pas le participant, vous pouvez l'inviter sur wishlist en entrant son email dans la barre de recherche"
        />
      )}
    />
  );
};
