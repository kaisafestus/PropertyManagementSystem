'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  LinearProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Person as PersonIcon, Save as SaveIcon } from '@mui/icons-material';
import api from '@/lib/api';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  property: {
    id: string;
    name: string;
  } | null;
  unit: {
    id: string;
    unitNumber: string;
  } | null;
  lease: {
    id: string;
    invoiceNumber: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    status: string;
  } | null;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);

export default function TenantProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/tenant-portal/profile');
        setProfile(data.profile || data);
        setPhone(data.profile?.phone || data.phone || '');
      } catch (err) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.patch('/tenant-portal/profile', { phone });
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Profile Not Found</Typography>
          <Typography variant="body2" color="text.secondary">
            Unable to load profile information.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        My Profile
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: 'success.main',
                  fontSize: 36,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Tenant
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Personal Information
              </Typography>

              <InfoRow label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
              <InfoRow label="Email Address" value={profile.email} />

              <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  size="small"
                />
              </Box>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Property & Lease Details
              </Typography>

              <InfoRow label="Property" value={profile.property?.name || 'N/A'} />
              <InfoRow label="Unit" value={profile.unit?.unitNumber || 'N/A'} />

              {profile.lease ? (
                <>
                  <InfoRow label="Lease Number" value={profile.lease.invoiceNumber} />
                  <InfoRow
                    label="Lease Period"
                    value={`${new Date(profile.lease.startDate).toLocaleDateString()} - ${new Date(profile.lease.endDate).toLocaleDateString()}`}
                  />
                  <InfoRow
                    label="Monthly Rent"
                    value={`KES ${profile.lease.monthlyRent.toLocaleString()}`}
                  />
                  <InfoRow label="Lease Status" value={profile.lease.status} />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1.5 }}>
                  No active lease
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
