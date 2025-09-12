import type { MobileDatePickerProps } from '@mui/x-date-pickers'
import type { DateTime } from 'luxon'

import { MobileDatePicker } from '@mui/x-date-pickers'
import { useState } from 'react'

export type WishlistDatePickerProps = {
  value: DateTime | null
  onChange: (date: DateTime | null) => void
  inputRef?: MobileDatePickerProps['inputRef']
  format?: MobileDatePickerProps['format']
  label?: MobileDatePickerProps['label']
  referenceDate?: MobileDatePickerProps['referenceDate']
  disabled?: boolean
  disablePast?: boolean
  disableFuture?: boolean
  fullWidth?: boolean
}

export const WishlistDatePicker = ({
  value,
  inputRef,
  format,
  label,
  disabled,
  onChange,
  disablePast,
  disableFuture,
  fullWidth,
}: WishlistDatePickerProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  return (
    <MobileDatePicker
      label={label}
      format={format}
      value={value}
      inputRef={inputRef}
      disabled={disabled}
      open={datePickerOpen}
      onClose={() => setDatePickerOpen(false)}
      onChange={date => onChange(date)}
      disablePast={disablePast}
      disableFuture={disableFuture}
      slotProps={{
        textField: {
          onClick: () => setDatePickerOpen(true),
          InputProps: {
            readOnly: true,
          },
          fullWidth,
        },
      }}
    />
  )
}
