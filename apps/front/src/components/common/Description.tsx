import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { alpha, Button, Collapse, styled } from '@mui/material';
import clsx from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';

import { MarkdownContent } from './MarkdownContent';

const DEFAULT_COLLAPSED_HEIGHT = 96;
// Avoid collapsing text that would only hide a line or two.
const COLLAPSE_TOLERANCE = 1.3;

const Root = styled('section')(({ theme }) => ({
  minWidth: 0,
  '&.card': {
    padding: theme.spacing(2),
    borderRadius: 16,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2.5, 3),
    },
  },
}));

const Content = styled(MarkdownContent)({
  fontSize: '0.95rem',
  lineHeight: 1.65,
  maxWidth: '75ch',
  overflowWrap: 'anywhere',
  transition: 'mask-image 0.3s ease',
  '&.faded': {
    maskImage: 'linear-gradient(to bottom, #000 45%, transparent 100%)',
  },
});

const ToggleButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1, 'auto', 0),
  padding: theme.spacing(0.5, 1.5),
  minHeight: 32,
  borderRadius: 999,
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.14),
    boxShadow: 'none',
  },
  '& .MuiButton-endIcon': {
    marginLeft: 2,
    transition: 'transform 0.2s ease',
  },
  '&.expanded .MuiButton-endIcon': {
    transform: 'rotate(180deg)',
  },
}));

export type DescriptionProps = {
  text: string;
  variant?: 'card' | 'plain';
  collapsedHeight?: number;
  className?: string;
};

export const Description = ({
  text,
  variant = 'card',
  collapsedHeight = DEFAULT_COLLAPSED_HEIGHT,
  className,
}: DescriptionProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [collapsable, setCollapsable] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const measure = () => setCollapsable(node.scrollHeight > collapsedHeight * COLLAPSE_TOLERANCE);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  return (
    <Root className={clsx(variant, className)}>
      <Collapse in={expanded || !collapsable} collapsedSize={collapsable ? collapsedHeight : undefined} timeout={300}>
        <Content ref={contentRef} text={text} className={clsx(collapsable && !expanded && 'faded')} />
      </Collapse>
      {collapsable && (
        <ToggleButton
          size="small"
          variant="text"
          className={clsx(expanded && 'expanded')}
          endIcon={<ExpandMoreIcon />}
          aria-expanded={expanded}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
        </ToggleButton>
      )}
    </Root>
  );
};
