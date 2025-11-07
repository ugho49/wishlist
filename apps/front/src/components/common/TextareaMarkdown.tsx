import type { TextFieldProps } from '@mui/material'
import type { ChangeEvent } from 'react'

import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { alpha, Box, Stack, styled, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import { Bold, Code, Heading, Italic, Link2, List, ListOrdered, Minus, TextQuote } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState } from 'react'

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
  borderTopLeftRadius: `calc(${theme.shape.borderRadius}px - 1px)`,
  borderTopRightRadius: `calc(${theme.shape.borderRadius}px - 1px)`,
  borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,
}))

const Container = styled(Stack)(() => ({}))

const TextareaAndHeaderContainer = styled(Stack)(({ theme }) => ({
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

const TextareaContainer = styled(Stack)(() => ({}))

const TextareaToolsContainer = styled(Stack)(({ theme }) => ({
  borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.23)}`,
  flexDirection: 'row',
  flexWrap: 'wrap',
  backgroundColor: theme.palette.grey[100],
}))

const IconButtonStyled = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
  opacity: 0.6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: alpha(theme.palette.action.hover, 0.12),
  },

  '& svg': {
    width: '20px',
    height: '20px',
  },
}))

const ToolIconButton = (params: { children: React.ReactNode; tooltipTitle: string; onClick: () => void }) => {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      params.onClick()
    }
  }

  return (
    <Tooltip title={params.tooltipTitle}>
      <IconButtonStyled role="button" tabIndex={0} onClick={params.onClick} onKeyDown={onKeyDown}>
        {params.children}
      </IconButtonStyled>
    </Tooltip>
  )
}

export const TextareaMarkdown = forwardRef<HTMLInputElement, TextareaMarkdownProps>(
  ({ value, onChange, maxLength, minRows = 4, helperText, ...props }, ref) => {
    const [mode, setMode] = useState<Mode>('write')
    const internalRef = useRef<HTMLTextAreaElement>(null)

    // Historique d'annulation
    const historyRef = useRef<string[]>([])
    const historyIndexRef = useRef<number>(-1)
    const isUndoRedoRef = useRef<boolean>(false)

    const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: Mode | null) => {
      if (newMode !== null) {
        setMode(newMode)
      }
    }

    // Gérer Ctrl+Z et Ctrl+Y
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const isMac = navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
        const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey

        if (isCtrlOrCmd && e.key === 'z' && !e.shiftKey) {
          // Ctrl+Z / Cmd+Z : Undo
          e.preventDefault()
          if (historyIndexRef.current > 0) {
            isUndoRedoRef.current = true
            historyIndexRef.current--
            const previousValue = historyRef.current[historyIndexRef.current]
            if (onChange) {
              const event = {
                target: { value: previousValue },
                currentTarget: { value: previousValue },
              } as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              onChange(event)
            }
          }
        } else if (isCtrlOrCmd && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
          // Ctrl+Y / Cmd+Shift+Z : Redo
          e.preventDefault()
          if (historyIndexRef.current < historyRef.current.length - 1) {
            isUndoRedoRef.current = true
            historyIndexRef.current++
            const nextValue = historyRef.current[historyIndexRef.current]
            if (onChange) {
              const event = {
                target: { value: nextValue },
                currentTarget: { value: nextValue },
              } as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              onChange(event)
            }
          }
        }
      }

      const textarea = internalRef.current
      if (textarea) {
        textarea.addEventListener('keydown', handleKeyDown)
        return () => textarea.removeEventListener('keydown', handleKeyDown)
      }
    }, [onChange])

    // Ajouter à l'historique quand la valeur change
    useEffect(() => {
      if (isUndoRedoRef.current) {
        isUndoRedoRef.current = false
        return
      }

      const currentValue = value ?? ''

      // Ajouter à l'historique seulement si la valeur a changé
      if (historyRef.current[historyIndexRef.current] !== currentValue) {
        // Supprimer tout ce qui est après l'index actuel (si on a fait undo puis on modifie)
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
        // Ajouter la nouvelle valeur
        historyRef.current.push(currentValue)
        historyIndexRef.current = historyRef.current.length - 1

        // Limiter l'historique à 50 entrées
        if (historyRef.current.length > 50) {
          historyRef.current.shift()
          historyIndexRef.current--
        }
      }
    }, [value])

    const insertMarkdown = (
      before: string,
      after = '',
      placeholder = '',
      type: 'inline' | 'line-start' | 'separator' = 'inline',
    ) => {
      const inputElement = internalRef.current
      if (!onChange || !inputElement) return

      // Focus d'abord pour s'assurer que les positions sont correctes
      inputElement.focus()

      const currentValue = value ?? ''
      let newValue = ''
      let newCursorPos = 0

      // Récupérer la position du curseur depuis l'input element
      const start = inputElement.selectionStart ?? 0
      const end = inputElement.selectionEnd ?? 0
      const hasSelection = start !== end

      if (type === 'inline') {
        // Pour gras, italique, code, lien : entourer la sélection ou insérer avec placeholder
        if (hasSelection) {
          // Cas 1: Zone sélectionnée -> entourer avec before/after
          const selectedText = currentValue.substring(start, end)
          newValue = currentValue.substring(0, start) + before + selectedText + after + currentValue.substring(end)
          newCursorPos = start + before.length + selectedText.length + after.length
        } else if (currentValue === '') {
          // Cas 2: Textarea vide -> insérer au début
          newValue = before + placeholder + after
          newCursorPos = before.length
        } else {
          // Cas 3: Curseur positionné mais rien de sélectionné -> insérer à la position du curseur
          newValue = currentValue.substring(0, start) + before + placeholder + after + currentValue.substring(start)
          newCursorPos = start + before.length
        }
      } else if (type === 'line-start') {
        // Pour titres, listes, citations : insérer au début de la ligne
        if (hasSelection) {
          // Zone sélectionnée -> insérer au début de la première ligne de la sélection
          const beforeSelection = currentValue.substring(0, start)
          const lineStart = beforeSelection.lastIndexOf('\n') + 1
          newValue = currentValue.substring(0, lineStart) + before + currentValue.substring(lineStart)
          newCursorPos = start + before.length
        } else if (currentValue === '') {
          // Textarea vide -> insérer une nouvelle ligne au début
          newValue = before + placeholder
          newCursorPos = before.length
        } else {
          // Curseur positionné -> insérer au début de la ligne courante
          const beforeCursor = currentValue.substring(0, start)
          const lineStart = beforeCursor.lastIndexOf('\n') + 1
          newValue = currentValue.substring(0, lineStart) + before + currentValue.substring(lineStart)
          newCursorPos = start + before.length
        }
      } else if (type === 'separator') {
        // Pour séparateur : insérer \n---\n
        if (hasSelection) {
          // Zone sélectionnée -> insérer au début de la première ligne de la sélection
          const beforeSelection = currentValue.substring(0, start)
          const lineStart = beforeSelection.lastIndexOf('\n') + 1
          newValue = currentValue.substring(0, lineStart) + before + currentValue.substring(lineStart)
          newCursorPos = lineStart + before.length
        } else if (currentValue === '') {
          // Textarea vide -> insérer au début
          newValue = before
          newCursorPos = before.length
        } else {
          // Curseur positionné -> insérer au début de la ligne courante
          const beforeCursor = currentValue.substring(0, start)
          const lineStart = beforeCursor.lastIndexOf('\n') + 1
          newValue = currentValue.substring(0, lineStart) + before + currentValue.substring(lineStart)
          newCursorPos = lineStart + before.length
        }
      }

      // Créer un événement pour déclencher onChange de React
      const event = {
        target: { value: newValue },
        currentTarget: { value: newValue },
      } as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

      onChange(event)

      // Repositionner le curseur après l'insertion
      requestAnimationFrame(() => {
        inputElement.focus()
        inputElement.setSelectionRange(newCursorPos, newCursorPos)
      })
    }

    const handleHeading = () => insertMarkdown('## ', '', 'Titre', 'line-start')
    const handleBold = () => insertMarkdown('**', '**', 'texte en gras', 'inline')
    const handleItalic = () => insertMarkdown('_', '_', 'texte en italique', 'inline')
    const handleLink = () => insertMarkdown('[', '](https://exemple.com)', 'texte du lien', 'inline')
    const handleQuote = () => insertMarkdown('> ', '', 'citation', 'line-start')
    const handleList = () => insertMarkdown('- ', '', 'élément de liste', 'line-start')
    const handleOrderedList = () => insertMarkdown('1. ', '', 'élément de liste', 'line-start')
    const handleSeparator = () => insertMarkdown('\n---\n', '', '', 'separator')
    const handleCode = () => insertMarkdown('`', '`', 'code', 'inline')

    const showHelperText = helperText || maxLength
    const displayValue = value ?? ''

    return (
      <Container>
        <TextareaAndHeaderContainer>
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
            <TextareaContainer>
              <TextareaToolsContainer>
                <ToolIconButton tooltipTitle="Titre" onClick={handleHeading}>
                  <Heading />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Gras" onClick={handleBold}>
                  <Bold strokeWidth={3} />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Italique" onClick={handleItalic}>
                  <Italic />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Lien" onClick={handleLink}>
                  <Link2 />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Citation" onClick={handleQuote}>
                  <TextQuote />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Liste à puces" onClick={handleList}>
                  <List />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Liste numérotée" onClick={handleOrderedList}>
                  <ListOrdered />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Séparation" onClick={handleSeparator}>
                  <Minus />
                </ToolIconButton>
                <ToolIconButton tooltipTitle="Code" onClick={handleCode}>
                  <Code />
                </ToolIconButton>
              </TextareaToolsContainer>

              <TextFieldStyled
                {...props}
                label={undefined}
                inputRef={element => {
                  // Connecter la ref interne
                  internalRef.current = element
                  // Propager la ref externe si elle existe
                  if (typeof ref === 'function') {
                    ref(element)
                  } else if (ref) {
                    ref.current = element
                  }
                }}
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
            </TextareaContainer>
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
        </TextareaAndHeaderContainer>
        {showHelperText && (
          <Box sx={{ ml: '14px', fontSize: '0.75rem', color: 'text.secondary' }}>
            {helperText || <CharsRemaining max={maxLength || 0} value={displayValue} />}
          </Box>
        )}
      </Container>
    )
  },
)

TextareaMarkdown.displayName = 'TextareaMarkdown'
