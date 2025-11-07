import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { alpha, Box, Collapse, Stack, styled } from '@mui/material'
import { useLayoutEffect, useRef, useState } from 'react'

import { BreaklineText } from './BreaklineText'
import { Card } from './Card'
import { MarkdownContent } from './MarkdownContent'

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
              {allowMarkdown ? <MarkdownContent text={text} /> : <BreaklineText text={text} />}
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
              {allowMarkdown ? <MarkdownContent text={text} /> : <BreaklineText text={text} />}
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
