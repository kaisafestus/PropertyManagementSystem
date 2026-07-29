'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import api from '@/lib/api';

interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
}

export default function OrganizationPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/organizations/current').then(({ data }) => {
      setOrg(data);
      setForm({ name: data.name, email: data.email, phone: data.phone || '' });
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.patch('/organizations/current', form);
      setOrg(data);
      setMessage('Organization updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (!org) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Organization
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Organization Details
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Organization Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Status: {org.status}
          </Typography>

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
