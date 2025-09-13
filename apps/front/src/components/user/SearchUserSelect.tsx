import type { MiniUserDto } from '@wishlist/common'

import PersonIcon from '@mui/icons-material/Person'
import { Autocomplete, Avatar, createFilterOptions, Stack, TextField } from '@mui/material'
import { blue, grey, orange } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import { isValidEmail } from '@wishlist/common'
import { debounce, uniqBy } from 'lodash'
import { useEffect, useState } from 'react'

import { useApi } from '../../hooks/useApi'

type UsualUserOptionType = MiniUserDto & { type: 'usual' }
type FriendUserOptionType = MiniUserDto & { type: 'friend'; order: number }
type UserOptionType = UsualUserOptionType | FriendUserOptionType

type OptionType = UserOptionType | string
const filter = createFilterOptions<OptionType>()

const GroupHeader = styled('div')(({ theme }) => ({
  position: 'sticky',
  top: '-8px',
  padding: '8px 16px',
  backgroundColor: grey[100],
  color: grey[700],
  fontSize: '0.875rem',
  fontWeight: 500,
  borderBottom: `1px solid ${grey[200]}`,
  zIndex: 10,
  ...theme.applyStyles('dark', {
    backgroundColor: grey[800],
    color: grey[300],
    borderBottom: `1px solid ${grey[700]}`,
  }),
}))

const GroupItems = styled('ul')({
  padding: 0,
  '& li': {
    position: 'relative',
    zIndex: 1,
    '&[aria-selected="true"]': {
      zIndex: 5,
      backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
    },
    '&:hover': {
      zIndex: 5,
    },
  },
})

export type SearchUserSelectProps = {
  label?: string
  disabled?: boolean
  onChange: (value: OptionType) => void
  excludedEmails: string[]
}

export const SearchUserSelect = ({ disabled, onChange, excludedEmails, label }: SearchUserSelectProps) => {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<OptionType[]>([])
  const [inputValue, setInputValue] = useState('')

  const searchUser = async (inputValue: string) => {
    setLoading(true)
    try {
      if (inputValue.trim() === '' || inputValue.trim().length < 2) {
        return
      }
      const users = await api.user.searchUserByKeyword(inputValue)
      const usualUsers = users.map<UsualUserOptionType>(user => ({ type: 'usual', ...user }))
      setOptions(prev => {
        const combined = uniqBy([...(prev as UserOptionType[]), ...usualUsers], v => v.id)
        return sortOptionsForGrouping(combined)
      })
    } finally {
      setLoading(false)
    }
  }

  const getClosestFriends = async () => {
    const data = await api.user.getClosestFriends(20)
    const friends = data.map<FriendUserOptionType>((user, index) => ({ type: 'friend', order: index, ...user }))
    setOptions(prev => {
      const combined = uniqBy([...(prev as UserOptionType[]), ...friends], v => v.id)
      return sortOptionsForGrouping(combined)
    })
  }

  const sortOptionsForGrouping = (options: UserOptionType[]): UserOptionType[] => {
    const friends: FriendUserOptionType[] = []
    const others: UsualUserOptionType[] = []

    options.forEach(option => {
      if (option.type === 'friend') {
        friends.push(option)
      } else {
        others.push(option)
      }
    })

    // Tri des amis récurrents : par order, puis alphabétique en cas d'égalité
    friends.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order
      }
      // En cas d'égalité d'ordre, tri alphabétique
      const nameA = `${a.firstname} ${a.lastname}`.toLowerCase()
      const nameB = `${b.firstname} ${b.lastname}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })

    // Tri des autres utilisateurs par ordre alphabétique
    others.sort((a, b) => {
      const nameA = `${a.firstname} ${a.lastname}`.toLowerCase()
      const nameB = `${b.firstname} ${b.lastname}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })

    // Retourner d'abord les amis, puis les autres
    return [...friends, ...others]
  }

  const getGroupByFunction = (option: OptionType): string => {
    if (typeof option === 'string') {
      return 'Invitation par email'
    }
    if (option.type === 'friend') {
      return 'Amis récurrents'
    }
    return 'Autres utilisateurs'
  }

  useEffect(() => {
    void getClosestFriends()
  }, [])

  const searchUserDebounced = debounce(searchUser, 400)

  return (
    <Autocomplete
      fullWidth
      clearOnBlur={false}
      blurOnSelect={false}
      disableCloseOnSelect={true}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue)
      }}
      loadingText="Chargement..."
      noOptionsText="Aucun résultat"
      disabled={disabled}
      options={options}
      loading={loading}
      onChange={(_, value) => {
        if (value) {
          onChange(value)
          setInputValue('') // Vider l'input après sélection
        }
      }}
      filterOptions={(values, params) => {
        const filtered = filter(values, params) as OptionType[]
        const { inputValue } = params

        const containValue = filtered.some(option => {
          if (typeof option === 'string') return option === inputValue
          return option.email === inputValue
        })

        if (!containValue && inputValue && isValidEmail(inputValue)) {
          filtered.push(inputValue.toLowerCase())
        }

        // Trier les options filtrées en maintenant le groupement
        const userOptions = filtered.filter((option): option is UserOptionType => typeof option !== 'string')
        const emailOptions = filtered.filter((option): option is string => typeof option === 'string')
        const sortedUserOptions = sortOptionsForGrouping(userOptions)

        return [...sortedUserOptions, ...emailOptions]
      }}
      groupBy={getGroupByFunction}
      renderGroup={params => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
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
          label={label}
          slotProps={{ htmlInput: { ...params.inputProps } }}
          onChange={e => {
            const value = e.target.value
            setInputValue(value)
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
