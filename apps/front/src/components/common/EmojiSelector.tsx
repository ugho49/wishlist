import type { MouseEvent } from 'react'

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { Button, IconButton, Popover, styled } from '@mui/material'
import { useState } from 'react'

const EmojiButtonContainer = styled('div')({
  position: 'relative',
  display: 'inline-block',
})

const EmojiButton = styled(Button)(({ theme }) => ({
  minWidth: '56px',
  height: '56px', // Match TextField default height
  fontSize: '1.5rem',
  borderRadius: '4px', // Match TextField border radius
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
  },
}))

const RemoveButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  width: '20px',
  height: '20px',
  minWidth: 'unset',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: '14px',
  '&:hover': {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    borderColor: theme.palette.error.main,
  },
}))

export type EmojiSelectorProps = {
  value?: string
  onChange: (emoji: string | undefined) => void
  disabled?: boolean
}

export const EmojiSelector = ({ value, onChange, disabled }: EmojiSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleEmojiSelect = (emoji: { native: string }) => {
    onChange(emoji.native)
    handleClose()
  }

  const handleRemoveEmoji = () => {
    onChange(undefined)
  }

  return (
    <>
      <EmojiButtonContainer>
        <EmojiButton onClick={handleClick} disabled={disabled} variant="outlined" aria-label="Sélectionner un emoji">
          {value || <AddReactionOutlinedIcon />}
        </EmojiButton>
        {value && (
          <RemoveButton
            onClick={handleRemoveEmoji}
            disabled={disabled}
            size="small"
            aria-label="Supprimer l'emoji"
            title="Supprimer l'emoji"
          >
            <CloseIcon fontSize="inherit" />
          </RemoveButton>
        )}
      </EmojiButtonContainer>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        keepMounted
      >
        <Picker
          data={data}
          onEmojiSelect={handleEmojiSelect}
          theme="light"
          set="native"
          skinTonePosition="none"
          previewPosition="none"
          maxFrequentRows={0}
          searchPosition="sticky"
          locale="fr"
        />
      </Popover>
    </>
  )
}
