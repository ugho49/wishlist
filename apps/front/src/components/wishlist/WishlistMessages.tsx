import type { CursorPaginatedWishlistMessagesDto, WishlistId, WishlistMessageDto } from '@wishlist/common'
import type { RootState } from '../../core'

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SendIcon from '@mui/icons-material/Send'
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  styled,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { useApi, useToast } from '../../hooks'

// --- Styled components ---

const ChatButton = styled(Box)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  padding: '12px 16px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
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

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
}))

const MessagesArea = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '12px 16px',
  gap: '8px',
})

const OwnMessageBubble = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px 16px 4px 16px',
  padding: '8px 14px',
  maxWidth: '75%',
  wordBreak: 'break-word',
  fontSize: '0.9rem',
  lineHeight: 1.5,
}))

const OtherMessageBubble = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  color: theme.palette.text.primary,
  borderRadius: '16px 16px 16px 4px',
  padding: '8px 14px',
  maxWidth: '75%',
  wordBreak: 'break-word',
  fontSize: '0.9rem',
  lineHeight: 1.5,
}))

const MessageMeta = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.7rem',
}))

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-end',
  padding: '12px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
}))

// --- Props ---

type WishlistMessagesProps = {
  wishlistId: WishlistId
  hideItems: boolean
  ownerFirstname: string
  coOwnerFirstname?: string
}

const mapState = (state: RootState) => state.auth.user?.id

export const WishlistMessages = ({
  wishlistId,
  hideItems,
  ownerFirstname,
  coOwnerFirstname,
}: WishlistMessagesProps) => {
  const currentUserId = useSelector(mapState)
  const api = useApi()
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesAreaRef = useRef<HTMLDivElement>(null)
  const isInitialLoad = useRef(true)

  const messagesQueryKey = ['wishlist-messages', { wishlistId }]
  const unreadQueryKey = ['wishlist-messages-unread', { wishlistId }]

  // Lightweight query for unread count (badge)
  const { data: unreadData } = useInfiniteQuery({
    queryKey: unreadQueryKey,
    queryFn: ({ signal }) => api.wishlistMessage.getMessages({ wishlistId, limit: 0 }, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
  })

  const unreadCount = unreadData?.pages[0]?.unread_count ?? 0

  // Paginated messages query (only fetched when dialog is open)
  const {
    data: messagesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: messagesQueryKey,
    queryFn: ({ pageParam, signal }) =>
      api.wishlistMessage.getMessages({ wishlistId, cursor: pageParam, limit: 20 }, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.next_cursor,
    enabled: open,
  })

  // Flatten all messages from all pages (pages are in reverse-chronological page order, but each page is chronological)
  const allMessages: WishlistMessageDto[] =
    messagesData?.pages
      .slice()
      .reverse()
      .flatMap(page => page.messages) ?? []

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (!open || allMessages.length === 0) return
    if (isInitialLoad.current) {
      messagesEndRef.current?.scrollIntoView()
      isInitialLoad.current = false
    }
  }, [open, allMessages.length])

  // Scroll to bottom after sending a new message
  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  // Infinite scroll: load older messages when scrolling to top
  const handleScroll = useCallback(() => {
    const area = messagesAreaRef.current
    if (!area || isFetchingNextPage || !hasNextPage) return
    if (area.scrollTop < 80) {
      const prevScrollHeight = area.scrollHeight
      fetchNextPage().then(() => {
        // Maintain scroll position after loading older messages
        requestAnimationFrame(() => {
          if (messagesAreaRef.current) {
            messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight - prevScrollHeight
          }
        })
      })
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Mark as read when opening the dialog
  const { mutate: markAsRead } = useMutation({
    mutationKey: ['wishlist-message.markAsRead'],
    mutationFn: () => api.wishlistMessage.markAsRead({ wishlist_id: wishlistId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unreadQueryKey })
    },
  })

  const handleOpen = () => {
    isInitialLoad.current = true
    setOpen(true)
    markAsRead()
  }

  const handleClose = () => {
    setOpen(false)
    // Invalidate to refresh unread count
    queryClient.invalidateQueries({ queryKey: unreadQueryKey })
  }

  // Send message
  const { mutateAsync: sendMessage, isPending: isSending } = useMutation({
    mutationKey: ['wishlist-message.create'],
    mutationFn: () => api.wishlistMessage.create({ wishlist_id: wishlistId, content: newMessage.trim() }),
    onSuccess: newMsg => {
      setNewMessage('')
      // Optimistically add the new message to the first page (most recent)
      queryClient.setQueryData(
        messagesQueryKey,
        (old: { pages: CursorPaginatedWishlistMessagesDto[]; pageParams: (string | undefined)[] } | undefined) => {
          if (!old) return old
          const pages = [...old.pages]
          const firstPage = { ...pages[0]!, messages: [...pages[0]!.messages, newMsg] }
          pages[0] = firstPage
          return { ...old, pages }
        },
      )
      scrollToBottom()
      // Mark as read after sending
      markAsRead()
    },
    onError: () => addToast({ message: "Impossible d'envoyer le message", variant: 'error' }),
  })

  // Delete message
  const { mutateAsync: deleteMessage } = useMutation({
    mutationKey: ['wishlist-message.delete'],
    mutationFn: (messageId: string) => api.wishlistMessage.delete(messageId as WishlistMessageDto['id']),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(
        messagesQueryKey,
        (old: { pages: CursorPaginatedWishlistMessagesDto[]; pageParams: (string | undefined)[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              messages: page.messages.filter(m => m.id !== messageId),
            })),
          }
        },
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

  // Build privacy message
  const privacyMessage = hideItems
    ? `Ces messages sont privés et ne seront pas visibles par ${ownerFirstname}${coOwnerFirstname ? ` ni ${coOwnerFirstname}` : ''}`
    : undefined

  return (
    <>
      {/* Chat button with unread badge */}
      <ChatButton onClick={handleOpen}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <ChatBubbleOutlineIcon fontSize="small" color="primary" />
          </Badge>
          <Typography variant="subtitle2" fontWeight={600}>
            Messages des participants
          </Typography>
          <NewBadge label="NEW" size="small" />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Ouvrir
        </Typography>
      </ChatButton>

      {/* Chat dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: fullScreen ? '100%' : '70vh',
            maxHeight: fullScreen ? '100%' : '70vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <ChatHeader>
          <Stack direction="row" alignItems="center" gap={1}>
            <ChatBubbleOutlineIcon fontSize="small" color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Messages
            </Typography>
          </Stack>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </ChatHeader>

        {/* Privacy info */}
        {privacyMessage && (
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon fontSize="small" />}
            sx={{ borderRadius: 0, py: 0.5, fontSize: '0.8rem' }}
          >
            {privacyMessage}
          </Alert>
        )}

        {/* Messages area */}
        <MessagesArea ref={messagesAreaRef} onScroll={handleScroll}>
          {/* Loading older messages indicator */}
          {isFetchingNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, alignItems: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!isLoading && allMessages.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucun message pour le moment. Soyez le premier !
              </Typography>
            </Box>
          )}

          {allMessages.map(message => {
            const isOwn = message.author.id === currentUserId
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwn ? 'flex-end' : 'flex-start',
                }}
              >
                {!isOwn && (
                  <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 0.3 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem' }} src={message.author.picture_url}>
                      {message.author.firstname?.charAt(0).toUpperCase()}
                    </Avatar>
                    <MessageMeta fontWeight={600}>{message.author.firstname}</MessageMeta>
                  </Stack>
                )}
                <Stack
                  direction="row"
                  alignItems="flex-end"
                  gap={0.5}
                  sx={{ flexDirection: isOwn ? 'row-reverse' : 'row' }}
                >
                  {isOwn ? (
                    <OwnMessageBubble>{message.content}</OwnMessageBubble>
                  ) : (
                    <OtherMessageBubble>{message.content}</OtherMessageBubble>
                  )}
                  {isOwn && (
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => deleteMessage(message.id)}
                        sx={{ opacity: 0.4, '&:hover': { opacity: 1 }, transition: 'opacity 0.2s', p: 0.3 }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                <MessageMeta sx={{ mt: 0.3, px: 0.5 }}>{DateTime.fromISO(message.created_at).toRelative()}</MessageMeta>
              </Box>
            )
          })}
          <div ref={messagesEndRef} />
        </MessagesArea>

        {/* Input at the bottom */}
        <InputContainer>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={3}
            placeholder="Écrire un message..."
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
      </Dialog>
    </>
  )
}
