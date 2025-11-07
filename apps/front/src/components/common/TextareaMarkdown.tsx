import type { TextFieldProps } from '@mui/material'
import type { ChangeEvent } from 'react'

import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Box, Stack, TextField, ToggleButton, ToggleButtonGroup, alpha, styled } from '@mui/material'
import { forwardRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { CharsRemaining } from './CharsRemaining'

type Mode = 'write' | 'preview'

interface TextareaMarkdownProps extends Omit<TextFieldProps, 'multiline' | 'minRows'> {
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  maxLength?: number
  minRows?: number
}

const PreviewContainer = styled(Box)(({ theme }) => ({
  padding: '16.5px 14px',
  minHeight: '104px',
  border: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,
  borderRadius: '4px',
  backgroundColor: theme.palette.background.paper,
  fontSize: '16px',
  lineHeight: 1.5,
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  overflow: 'auto',
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
  '& p': {
    margin: '0 0 12px 0',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: '16px',
    marginBottom: '8px',
    fontWeight: 600,
    '&:first-child': {
      marginTop: 0,
    },
  },
  '& h1': { fontSize: '2em' },
  '& h2': { fontSize: '1.5em' },
  '& h3': { fontSize: '1.25em' },
  '& ul, & ol': {
    paddingLeft: '24px',
    margin: '8px 0',
  },
  '& li': {
    marginBottom: '4px',
  },
  '& code': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.9em',
    fontFamily: 'monospace',
  },
  '& pre': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    margin: '8px 0',
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    margin: '8px 0',
    paddingLeft: '16px',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& hr': {
    border: 'none',
    borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
    margin: '16px 0',
  },
  '& table': {
    borderCollapse: 'collapse',
    width: '100%',
    margin: '8px 0',
  },
  '& th, & td': {
    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
    padding: '8px',
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    fontWeight: 600,
  },
  '& img': {
    maxWidth: '100%',
    height: 'auto',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 10px',
    fontSize: '14px',
  },
}))

const EmptyPreview = styled(Box)(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontStyle: 'italic',
}))

const ModeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: '12px',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    '& .MuiToggleButton-root': {
      flex: 1,
      fontSize: '0.875rem',
      padding: '6px 12px',
    },
  },
}))

export const TextareaMarkdown = forwardRef<HTMLDivElement, TextareaMarkdownProps>(
  ({ value = '', onChange, maxLength, minRows = 4, helperText, ...props }, ref) => {
    const [mode, setMode] = useState<Mode>('write')

    const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: Mode | null) => {
      if (newMode !== null) {
        setMode(newMode)
      }
    }

    const showHelperText = helperText || maxLength

    return (
      <Stack ref={ref} gap={1}>
        <ModeToggle value={mode} exclusive onChange={handleModeChange} aria-label="mode toggle" size="small">
          <ToggleButton value="write" aria-label="write mode">
            <EditIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Écrire
            </Box>
          </ToggleButton>
          <ToggleButton value="preview" aria-label="preview mode">
            <VisibilityIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Aperçu
            </Box>
          </ToggleButton>
        </ModeToggle>

        {mode === 'write' && (
          <TextField
            {...props}
            value={value}
            onChange={onChange}
            multiline
            minRows={minRows}
            slotProps={{
              htmlInput: {
                maxLength,
              },
            }}
            helperText={showHelperText ? helperText || <CharsRemaining max={maxLength || 0} value={value} /> : undefined}
          />
        )}

        {mode === 'preview' && (
          <Stack gap={1}>
            <PreviewContainer>
              {value.trim() === '' ? (
                <EmptyPreview>Aucun contenu à prévisualiser</EmptyPreview>
              ) : (
                <Markdown remarkPlugins={[remarkGfm]}>{value}</Markdown>
              )}
            </PreviewContainer>
            {showHelperText && (
              <Box sx={{ ml: '14px', fontSize: '0.75rem', color: 'text.secondary' }}>
                {helperText || <CharsRemaining max={maxLength || 0} value={value} />}
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    )
  },
)

TextareaMarkdown.displayName = 'TextareaMarkdown'
