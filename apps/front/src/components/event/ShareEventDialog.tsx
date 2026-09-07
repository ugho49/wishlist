import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { useToast } from '../../hooks';

export type ShareEventDialogProps = {
  open: boolean;
  title: string;
  inviteToken: string;
  onClose: () => void;
};

export const ShareEventDialog = ({ open, title, inviteToken, onClose }: ShareEventDialogProps) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);
  const inviteUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/invite/${inviteToken}`;
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      addToast({ message: 'Lien copié', variant: 'success' });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast({ message: 'Impossible de copier le lien', variant: 'error' });
    }
  };

  const shareNative = async () => {
    try {
      await navigator.share({
        title,
        text: `Rejoins mon événement « ${title} » sur Wishlist`,
        url: inviteUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      addToast({ message: 'Le partage a échoué', variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Partager l'événement</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Envoyez ce lien à vos proches. Ils pourront voir l'événement et le rejoindre, même sans invitation par
            email.
          </Typography>
          <TextField value={inviteUrl} fullWidth slotProps={{ input: { readOnly: true } }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose}>Fermer</Button>
        {canNativeShare && (
          <Button variant="outlined" startIcon={<IosShareIcon />} onClick={() => void shareNative()}>
            Partager
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          onClick={() => void copyLink()}
        >
          {copied ? 'Copié' : 'Copier le lien'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
