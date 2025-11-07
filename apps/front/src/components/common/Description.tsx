import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { alpha, Box, Collapse, Stack, styled } from '@mui/material'
import { useLayoutEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { BreaklineText } from './BreaklineText'
import { Card } from './Card'

const DescriptionCard = styled(Card)<{ collapsable: boolean }>(({ theme, collapsable }) => ({
  position: 'relative',
  padding: '12px',
  paddingBottom: collapsable ? '25px' : undefined,
  borderRadius: '12px',
  color: theme.palette.text.primary,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  fontSize: '16px',
  lineHeight: 1.6,
  fontWeight: 400,
  textAlign: 'left',
  borderLeft: `8px solid ${theme.palette.primary.main}`,
  cursor: collapsable ? 'pointer' : 'default',
  transition: 'background-color 0.2s ease-in-out',
}))

const DescriptionContainer = styled(Stack)(() => ({
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: '16px',
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  paddingTop: '6px',
  flexShrink: 0,
}))

const ContentWrapper = styled(Box)({
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
})

const MarkdownContent = styled(Box)(({ theme }) => ({
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
  '& h1': { fontSize: '1.5em' },
  '& h2': { fontSize: '1.25em' },
  '& h3': { fontSize: '1.1em' },
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
    borderLeft: `4px solid ${alpha(theme.palette.primary.main, 0.3)}`,
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
    fontSize: '0.9em',
  },
  '& th, & td': {
    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
    padding: '6px 8px',
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
}))

const EllipsisOverlay = styled(Box)(() => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '25px',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  paddingBottom: '4px',
}))

const MAX_HEIGHT = 110 // Maximum height in pixels before showing collapse button

export const Description = ({ text, allowMarkdown = false }: { text: string; allowMarkdown?: boolean }) => {
  const [isCollapsable, setIsCollapsable] = useState<boolean | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  useLayoutEffect(() => {
    if (contentRef.current && !isInitialized.current) {
      const contentHeight = contentRef.current.scrollHeight
      setIsCollapsable(contentHeight > MAX_HEIGHT)
      isInitialized.current = true
    }
  }, [])

  const toggleExpanded = () => {
    if (isCollapsable) {
      setIsExpanded(prev => !prev)
    }
  }

  // Don't render until we know if it's collapsable or not
  if (isCollapsable === null) {
    return (
      <DescriptionCard collapsable={false} onClick={undefined}>
        <DescriptionContainer>
          <IconWrapper>
            <InfoOutlinedIcon fontSize="small" />
          </IconWrapper>
          <ContentWrapper>
            <Box ref={contentRef} sx={{ opacity: 0 }}>
              {allowMarkdown ? (
                <MarkdownContent>
                  <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
                </MarkdownContent>
              ) : (
                <BreaklineText text={text} />
              )}
            </Box>
          </ContentWrapper>
        </DescriptionContainer>
      </DescriptionCard>
    )
  }

  return (
    <DescriptionCard collapsable={isCollapsable} onClick={toggleExpanded}>
      <DescriptionContainer>
        <IconWrapper>
          <InfoOutlinedIcon fontSize="small" />
        </IconWrapper>
        <ContentWrapper>
          <Collapse
            in={isExpanded || !isCollapsable}
            collapsedSize={isCollapsable ? MAX_HEIGHT : undefined}
            timeout={300}
          >
            <Box ref={contentRef}>
              {allowMarkdown ? (
                <MarkdownContent>
                  <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
                </MarkdownContent>
              ) : (
                <BreaklineText text={text} />
              )}
            </Box>
          </Collapse>
        </ContentWrapper>
      </DescriptionContainer>
      {isCollapsable && (
        <EllipsisOverlay>
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </EllipsisOverlay>
      )}
    </DescriptionCard>
  )
}
