import type { MobileDatePickerProps } from '@mui/x-date-pickers'
import type { DateTime } from 'luxon'

import { TextField } from '@mui/material'
import { MobileDatePicker } from '@mui/x-date-pickers'
import { useState } from 'react'

export type WishlistDatePickerProps = {
  value: DateTime | null
  minDate?: DateTime
  onChange: (date: DateTime | null) => void
  inputRef?: MobileDatePickerProps['inputRef']
  format?: MobileDatePickerProps['format']
  label?: MobileDatePickerProps['label']
  referenceDate?: MobileDatePickerProps['referenceDate']
  disabled?: boolean
  required?: boolean
  disablePast?: boolean
  disableFuture?: boolean
  fullWidth?: boolean
  placeholder?: string
  error?: boolean
  helperText?: string
}

export const WishlistDatePicker = ({
  required,
  value,
  minDate,
  inputRef,
  format,
  label,
  disabled,
  onChange,
  disablePast,
  disableFuture,
  fullWidth,
  placeholder = 'Sélectionner une date',
  error,
  helperText,
}: WishlistDatePickerProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  return (
    <>
      <TextField
        ref={inputRef}
        label={label}
        required={required}
        fullWidth={fullWidth}
        disabled={disabled}
        error={error}
        helperText={helperText}
        slotProps={{
          input: { readOnly: true },
        }}
        placeholder={placeholder}
        value={value ? value.toFormat(format || 'dd/MM/yyyy') : ''}
        onClick={() => !disabled && setDatePickerOpen(true)}
        sx={{ cursor: disabled ? 'default' : 'pointer' }}
      />

      <MobileDatePicker
        format={format}
        value={value}
        disabled={disabled}
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        onChange={date => onChange(date)}
        disablePast={disablePast}
        disableFuture={disableFuture}
        minDate={minDate}
        slotProps={{
          textField: {
            sx: { display: 'none' },
          },
        }}
      />
    </>
  )
}
