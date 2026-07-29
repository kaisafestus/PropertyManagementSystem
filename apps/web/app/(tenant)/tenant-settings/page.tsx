'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Lock as LockIcon } from '@mui/icons-material';
import api from '@/lib/api';

export default function TenantSettingsPage() {
  const [loading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    maintenanceUpdates: true,
    noticeAlerts: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  const [language, setLanguage] = useState('en');
  const [savingLanguage, setSavingLanguage] = useState(false);

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSavingPassword(true);
    try {
      await api.post('/tenant-portal/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotificationSave = async () => {
    setError('');
    setSuccess('');
    setSavingNotifications(true);
    try {
      await api.patch('/tenant-portal/settings/notifications', notifications);
      setSuccess('Notification preferences updated');
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to update preferences');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleLanguageSave = async () => {
    setError('');
    setSuccess('');
    setSavingLanguage(true);
    try {
      await api.patch('/tenant-portal/settings/language', { language });
      setSuccess('Language preference updated');
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to update language');
    } finally {
      setSavingLanguage(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LockIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Change Password
                </Typography>
              </Box>

              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handlePasswordChange}
                disabled={
                  savingPassword ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Language
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  label="Language"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="sw">Swahili</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="ar">Arabic</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleLanguageSave}
                disabled={savingLanguage}
              >
                {savingLanguage ? 'Saving...' : 'Save Language'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Notification Preferences
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emailNotifications: e.target.checked })
                    }
                  />
                }
                label="Email Notifications"
              />
              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.smsNotifications}
                    onChange={(e) =>
                      setNotifications({ ...notifications, smsNotifications: e.target.checked })
                    }
                  />
                }
                label="SMS Notifications"
              />
              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.paymentReminders}
                    onChange={(e) =>
                      setNotifications({ ...notifications, paymentReminders: e.target.checked })
                    }
                  />
                }
                label="Payment Reminders"
              />
              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.maintenanceUpdates}
                    onChange={(e) =>
                      setNotifications({ ...notifications, maintenanceUpdates: e.target.checked })
                    }
                  />
                }
                label="Maintenance Updates"
              />
              <Divider sx={{ my: 1 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.noticeAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, noticeAlerts: e.target.checked })
                    }
                  />
                }
                label="Notice Alerts"
              />
              <Divider sx={{ my: 1 }} />

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleNotificationSave}
                  disabled={savingNotifications}
                >
                  {savingNotifications ? 'Saving...' : 'Save Preferences'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
