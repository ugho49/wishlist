import PersonIcon from '@mui/icons-material/Person'
import { Autocomplete, Avatar, createFilterOptions, Stack, TextField } from '@mui/material'
import { blue, orange } from '@mui/material/colors'
import { isValidEmail } from '@wishlist/common'
import { MiniUserDto } from '@wishlist/common-types'
import { debounce, uniqBy } from 'lodash'
import React, { useState } from 'react'

import { useApi } from '../../hooks/useApi'

type UserOptionType = MiniUserDto | string
const filter = createFilterOptions<UserOptionType>()

export type SearchUserSelectProps = {
  disabled?: boolean
  onChange: (value: UserOptionType) => void
  excludedEmails: string[]
}

export const SearchUserSelect = ({ disabled, onChange, excludedEmails }: SearchUserSelectProps) => {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<UserOptionType[]>([])

  const searchUser = async (inputValue: string) => {
    setLoading(true)
    try {
      if (inputValue.trim() === '' || inputValue.trim().length < 2) {
        return
      }
      const users = await api.user.searchUserByKeyword(inputValue)
      setOptions(prev => uniqBy([...(prev as MiniUserDto[]), ...users], v => v.id))
    } finally {
      setLoading(false)
    }
  }

  // TODO: first call previous "friend" or "usual" user endpoint

  const searchUserDebounced = debounce(searchUser, 400)

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
        if (value) onChange(value)
      }}
      filterOptions={(values, params) => {
        const filtered = filter(values, params)
        const { inputValue } = params

        const containValue = filtered.some(option => {
          if (typeof option === 'string') return option === inputValue
          return option.email === inputValue
        })

        if (!containValue && inputValue && isValidEmail(inputValue)) {
          filtered.push(inputValue.toLowerCase())
        }

        return filtered
      }}
      getOptionDisabled={option => {
        if (typeof option === 'string') return excludedEmails.includes(option)
        return excludedEmails.includes(option.email)
      }}
      getOptionLabel={option => {
        if (typeof option === 'string') return `Inviter le participant par son email: ${option}`
        return `${option.firstname} ${option.lastname} (${option.email})`
      }}
      renderOption={(props, option) => (
        <li {...props}>
          <Stack direction="row" gap={1} alignItems="center">
            <Avatar
              sx={{
                width: '30px',
                height: '30px',
                bgcolor: typeof option === 'string' ? orange[100] : blue[100],
                color: typeof option === 'string' ? orange[600] : blue[600],
              }}
              src={typeof option !== 'string' ? option?.picture_url : undefined}
            >
              <PersonIcon />
            </Avatar>
            {typeof option === 'string' ? (
              <>
                <span>Inviter le participant par son email:</span>
                <b>{option}</b>
              </>
            ) : (
              <>
                <b>
                  {option.firstname} {option.lastname}
                </b>
                <span>({option.email})</span>
              </>
            )}
          </Stack>
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          inputProps={{ ...params.inputProps }}
          onChange={e => {
            const value = e.target.value
            if (value.length > 1) setLoading(true)
            searchUserDebounced(value)
          }}
          placeholder="Rechercher un participant ..."
          helperText="Si vous ne trouvez pas le participant, vous pouvez l'inviter sur wishlist en entrant son email dans la barre de recherche"
        />
      )}
    />
  )
}
