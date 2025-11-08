import { alpha, Box, type BoxProps, Link, styled } from '@mui/material'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { isValidUrl } from '../../utils/router.utils'

const MarkdownContainer = styled(Box)(({ theme }) => ({
  fontSize: '1em',
  '& p': {
    margin: 0,
    marginBottom: '12px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    fontWeight: 600,
    marginTop: '8px',
    marginBottom: '8px',
    '&:first-child': {
      marginTop: 0,
    },
  },
  '& h1': { fontSize: '1.4em' },
  '& h2': { fontSize: '1.30em' },
  '& h3': { fontSize: '1.20em' },
  '& h4': { fontSize: '1.15em' },
  '& h5, & h6': { fontSize: '1.10em' },
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
    fontSize: '0.9em',
  },
  '& th, & td': {
    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
    textAlign: 'left',
    padding: '6px 8px',
  },
  '& th': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    fontWeight: 600,
  },
  '& img': {
    width: '100%',
    maxWidth: '200px',
    height: 'auto',
  },
  '& strong': {
    fontWeight: 500,
  },
}))

const markdownComponents = {
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) =>
    href && isValidUrl(href) ? (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    ) : (
      <p>{children}</p>
    ),
  img: ({ src, alt }: { src?: string; alt?: string }) => <img src={src && isValidUrl(src) ? src : ''} alt={alt} />,
}

type MarkdownContentProps = BoxProps & {
  text: string
}

export const MarkdownContent = ({ text, ...props }: MarkdownContentProps) => {
  return (
    <MarkdownContainer {...props}>
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </Markdown>
    </MarkdownContainer>
  )
}
