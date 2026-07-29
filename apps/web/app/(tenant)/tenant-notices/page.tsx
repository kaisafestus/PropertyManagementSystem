'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Alert } from '@mui/material';
import { Notifications as NoticeIcon, MarkEmailRead as ReadIcon } from '@mui/icons-material';
import api from '@/lib/api';

interface Notice {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: string;
  author?: string;
}

const priorityColorMap: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
  URGENT: 'error',
  HIGH: 'warning',
  NORMAL: 'info',
  LOW: 'default',
};

export default function TenantNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const { data } = await api.get('/tenant-portal/notices');
        setNotices(data.notices || data || []);
      } catch (err) {
        setError('Failed to fetch notices');
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Notices & Announcements
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {notices.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <NoticeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notices or announcements at this time.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {notices.map((notice) => (
            <Card
              key={notice.id}
              sx={{
                borderLeft: notice.read ? '4px solid' : '4px solid',
                borderColor: notice.read ? 'divider' : 'primary.main',
                bgcolor: notice.read ? 'background.paper' : 'grey.50',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {notice.title}
                    </Typography>
                    {!notice.read && (
                      <Chip label="New" color="primary" size="small" icon={<ReadIcon />} />
                    )}
                  </Box>
                  {notice.priority && notice.priority !== 'NORMAL' && (
                    <Chip
                      label={notice.priority}
                      color={priorityColorMap[notice.priority] || 'default'}
                      size="small"
                    />
                  )}
                </Box>

                <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                  {notice.message}
                </Typography>

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {notice.author && `By ${notice.author} • `}
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={notice.read ? 'Read' : 'Unread'}
                    variant="outlined"
                    size="small"
                    color={notice.read ? 'default' : 'info'}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
