'use client';

import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Divider, Alert } from '@mui/material';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Settings
      </Typography>

      <Card sx={{ maxWidth: 600, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Account
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Name:</strong> {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Email:</strong> {user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Role:</strong> {user?.role}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Organization ID:</strong> {user?.organizationId}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Session
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {!confirming ? (
            <Button variant="outlined" color="error" onClick={() => setConfirming(true)}>
              Sign Out
            </Button>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to sign out?
              </Alert>
              <Button variant="contained" color="error" onClick={handleLogout} sx={{ mr: 1 }}>
                Yes, Sign Out
              </Button>
              <Button variant="outlined" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
