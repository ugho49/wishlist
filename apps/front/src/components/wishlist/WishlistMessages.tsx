import type { WishlistId, WishlistMessageDto } from '@wishlist/common'
import type { RootState } from '../../core'

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SendIcon from '@mui/icons-material/Send'
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  styled,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useApi, useToast } from '../../hooks'

const MessagesContainer = styled(Box)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
}))

const MessagesHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const MessageItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  padding: '12px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  '&:hover .delete-button': {
    opacity: 1,
  },
}))

const MessageContent = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '0.9rem',
  lineHeight: 1.5,
  wordBreak: 'break-word',
}))

const MessageMeta = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
}))

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-end',
  padding: '12px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
}))

const NewBadge = styled(Chip)(({ theme }) => ({
  fontSize: '0.6rem',
  height: '18px',
  padding: '0 4px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  borderRadius: '9px',
  animation: 'pulse 2s infinite',
  '&.MuiChip-root': {
    fontSize: '0.6rem',
    fontWeight: 'bold',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
}))

type WishlistMessagesProps = {
  wishlistId: WishlistId
}

const mapState = (state: RootState) => state.auth.user?.id

export const WishlistMessages = ({ wishlistId }: WishlistMessagesProps) => {
  const currentUserId = useSelector(mapState)
  const api = useApi()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const queryKey = ['wishlist-messages', { wishlistId }]

  const { data: messages = [], isLoading } = useQuery({
    queryKey,
    queryFn: ({ signal }) => api.wishlistMessage.getMessages(wishlistId, { signal }),
    enabled: expanded,
  })

  const { mutateAsync: sendMessage, isPending: isSending } = useMutation({
    mutationKey: ['wishlist-message.create'],
    mutationFn: () => api.wishlistMessage.create({ wishlist_id: wishlistId, content: newMessage.trim() }),
    onSuccess: newMsg => {
      setNewMessage('')
      queryClient.setQueryData(queryKey, (old: WishlistMessageDto[] | undefined) => [newMsg, ...(old ?? [])])
      addToast({ message: 'Message envoyé', variant: 'success' })
    },
    onError: () => addToast({ message: "Impossible d'envoyer le message", variant: 'error' }),
  })

  const { mutateAsync: deleteMessage } = useMutation({
    mutationKey: ['wishlist-message.delete'],
    mutationFn: (messageId: string) => api.wishlistMessage.delete(messageId as WishlistMessageDto['id']),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(
        queryKey,
        (old: WishlistMessageDto[] | undefined) => old?.filter(m => m.id !== messageId) ?? [],
      )
      addToast({ message: 'Message supprimé', variant: 'info' })
    },
    onError: () => addToast({ message: 'Impossible de supprimer le message', variant: 'error' }),
  })

  const handleSend = () => {
    if (newMessage.trim().length === 0) return
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <MessagesContainer>
      <MessagesHeader onClick={() => setExpanded(prev => !prev)}>
        <Stack direction="row" alignItems="center" gap={1}>
          <ChatBubbleOutlineIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight={600}>
            Messages des participants
          </Typography>
          <NewBadge label="NEW" size="small" />
          {messages.length > 0 && (
            <Chip
              label={messages.length}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {expanded ? 'Replier' : 'Déplier'}
        </Typography>
      </MessagesHeader>

      <Collapse in={expanded}>
        {/* Input */}
        <InputContainer>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={3}
            placeholder="Ajouter un message pour les autres participants..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <IconButton color="primary" onClick={handleSend} disabled={isSending || newMessage.trim().length === 0}>
            {isSending ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </InputContainer>

        {/* Messages list */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading && messages.length === 0 && (
          <Box sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucun message pour le moment. Soyez le premier !
            </Typography>
          </Box>
        )}

        {messages.map(message => (
          <MessageItem key={message.id}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem' }} src={message.author.picture_url}>
              {message.author.firstname?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <MessageMeta fontWeight={600}>{message.author.firstname}</MessageMeta>
                <MessageMeta>{DateTime.fromISO(message.created_at).toRelative()}</MessageMeta>
              </Stack>
              <MessageContent>{message.content}</MessageContent>
            </Box>
            {message.author.id === currentUserId && (
              <Tooltip title="Supprimer">
                <IconButton
                  className="delete-button"
                  size="small"
                  onClick={() => deleteMessage(message.id)}
                  sx={{ opacity: 0, transition: 'opacity 0.2s' }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </MessageItem>
        ))}
      </Collapse>
    </MessagesContainer>
  )
}
