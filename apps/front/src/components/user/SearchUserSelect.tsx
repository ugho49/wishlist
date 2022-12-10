import React, { useState } from 'react';
import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import { MiniUserDto } from '@wishlist/common-types';
import { debounce, merge, uniqBy } from 'lodash';
import { isValidEmail, useApi } from '@wishlist/common-front';
import { wishlistApiRef } from '../../core/api/wishlist.api';

type UserOptionType = MiniUserDto | string;
const filter = createFilterOptions<UserOptionType>();

export type SearchUserSelectProps = {
  disabled?: boolean;
  onChange: (value: UserOptionType) => void;
  excludedEmails: string[];
};

export const SearchUserSelect = ({ disabled, onChange, excludedEmails }: SearchUserSelectProps) => {
  const api = useApi(wishlistApiRef);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<UserOptionType[]>([]);

  const searchUser = async (inputValue: string) => {
    setLoading(true);
    try {
      if (inputValue.trim() === '' || inputValue.trim().length < 2) {
        return;
      }
      const users = await api.user.searchUserByKeyword(inputValue);
      setOptions((prev) => uniqBy(merge(prev, users), (v) => v.id));
    } finally {
      setLoading(false);
    }
  };

  // TODO: first call previous "friend" or "usual" user endpoint

  const searchUserDebounced = debounce(searchUser, 400);

  return (
    <Autocomplete
      fullWidth
      clearOnBlur
      blurOnSelect={true}
      value={null}
      loadingText="Chargement..."
      noOptionsText="Aucun résultat"
      disabled={disabled}
      options={options}
      loading={loading}
      onChange={(_, value) => {
        if (value) onChange(value);
      }}
      filterOptions={(values, params) => {
        const filtered = filter(values, params);
        const { inputValue } = params;

        const containValue = filtered.some((option) => {
          if (typeof option === 'string') return option === inputValue;
          return option.email === inputValue;
        });

        if (!containValue && inputValue && isValidEmail(inputValue)) {
          filtered.push(inputValue.toLowerCase());
        }

        return filtered;
      }}
      getOptionDisabled={(option) => {
        if (typeof option === 'string') return excludedEmails.includes(option);
        return excludedEmails.includes(option.email);
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return `Inviter le participant par son email: ${option}`;
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
          placeholder="Rechercher un participant ..."
          helperText="Si vous ne trouvez pas le participant, vous pouvez l'inviter sur wishlist en entrant son email dans la barre de recherche"
        />
      )}
    />
  );
};
