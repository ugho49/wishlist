import type { TextFieldProps } from '@mui/material'
import type { ChangeEvent } from 'react'

import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { alpha, Box, Stack, styled, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { forwardRef, useState } from 'react'

import { CharsRemaining } from './CharsRemaining'
import { MarkdownContent } from './MarkdownContent'

type Mode = 'write' | 'preview'

interface TextareaMarkdownProps extends Omit<TextFieldProps, 'multiline' | 'minRows' | 'value' | 'onChange'> {
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  maxLength?: number
  minRows?: number
}

const PreviewContainer = styled(MarkdownContent)(({ theme }) => ({
  padding: '16.5px 14px',
  minHeight: '104px',
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  overflow: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: '12px 10px',
  },
}))

const ModeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    '& .MuiToggleButton-root': {
      flex: 1,
      fontSize: '0.875rem',
      padding: '6px 12px',
    },
  },
}))

const ModeToggleItem = styled(ToggleButton)(({ theme }) => ({
  border: 'none',
  borderRadius: 0,
  borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,

  '&:first-child': {
    borderTopLeftRadius: `calc(${theme.shape.borderRadius}px - 1px)`,
  },
}))

const MainStack = styled(Stack)(({ theme }) => ({
  border: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,
  borderRadius: theme.shape.borderRadius,
}))

const TextFieldStyled = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,

    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
}))

export const TextareaMarkdown = forwardRef<HTMLInputElement, TextareaMarkdownProps>(
  ({ value, onChange, maxLength, minRows = 4, helperText, ...props }, ref) => {
    const [mode, setMode] = useState<Mode>('write')

    const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: Mode | null) => {
      if (newMode !== null) {
        setMode(newMode)
      }
    }

    const showHelperText = helperText || maxLength
    const displayValue = value ?? ''

    return (
      <Stack>
        <MainStack>
          <ModeToggle value={mode} exclusive onChange={handleModeChange} aria-label="mode toggle" size="small">
            <ModeToggleItem value="write" aria-label="write mode">
              <EditIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Écrire
              </Box>
            </ModeToggleItem>
            <ModeToggleItem value="preview" aria-label="preview mode">
              <VisibilityIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Aperçu
              </Box>
            </ModeToggleItem>
          </ModeToggle>

          {mode === 'write' && (
            <TextFieldStyled
              {...props}
              label={undefined}
              inputRef={ref}
              value={displayValue}
              onChange={onChange}
              multiline
              minRows={minRows}
              slotProps={{
                htmlInput: {
                  maxLength,
                },
              }}
            />
          )}

          {mode === 'preview' && (
            <Stack gap={1}>
              {displayValue === '' ? (
                <PreviewContainer text="*Aucun contenu à prévisualiser*" />
              ) : (
                <PreviewContainer text={displayValue} />
              )}
            </Stack>
          )}
        </MainStack>
        {showHelperText && (
          <Box sx={{ ml: '14px', fontSize: '0.75rem', color: 'text.secondary' }}>
            {helperText || <CharsRemaining max={maxLength || 0} value={displayValue} />}
          </Box>
        )}
      </Stack>
    )
  },
)

TextareaMarkdown.displayName = 'TextareaMarkdown'
