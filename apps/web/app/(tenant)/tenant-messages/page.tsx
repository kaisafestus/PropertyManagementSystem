'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  read: boolean;
}

export default function TenantMessagesPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await api.get('/tenant-portal/messages');
        setMessages(data.messages || data || []);
      } catch (err) {
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post('/tenant-portal/messages', { content: newMessage });
      setMessages((prev) => [...prev, data.message || data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Messages
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
        <CardContent
          sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                No messages yet. Start a conversation with property management.
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.senderId === user?.id;
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: isOwnMessage ? 'primary.main' : 'success.main',
                      width: 36,
                      height: 36,
                      fontSize: 14,
                    }}
                  >
                    {isOwnMessage
                      ? `${user?.firstName?.[0]}${user?.lastName?.[0]}`
                      : msg.senderName
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)}
                  </Avatar>
                  <Box sx={{ maxWidth: '70%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {isOwnMessage ? 'You' : msg.senderName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {msg.senderRole}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                        color: isOwnMessage ? 'white' : 'text.primary',
                        borderRadius: 2,
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </CardContent>

        <Divider />

        <Box sx={{ p: 2, display: 'flex', gap: 1.5 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            sx={{ minWidth: 100 }}
          >
            Send
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
