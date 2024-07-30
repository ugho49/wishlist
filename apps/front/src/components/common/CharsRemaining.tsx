import React from 'react'

export type CharsRemainingProps = {
  max: number
  value?: string
}

export const CharsRemaining = ({ max, value }: CharsRemainingProps) => {
  const current = value?.length || 0
  const remaining = max - current

  if (current === 0) {
    return null
  }

  return (
    <>
      Plus que {remaining} {remaining > 1 ? 'caractères' : 'caractère'}
    </>
  )
}
