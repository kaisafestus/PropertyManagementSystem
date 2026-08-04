'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Collapse,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface Property {
  id: string;
  name: string;
}
interface Unit {
  id: string;
  unitNumber: string;
  propertyId: string;
}
interface Organization {
  id: string;
  name: string;
}

const emptyForm = {
  organizationId: '',
  propertyId: '',
  unitId: '',
  firstName: '',
  lastName: '',
  phone: '+254',
  email: '',
  // "Show More" fields
  nationalId: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
};

export default function AddTenantPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/organizations/current')
      .then(({ data }) => {
        setOrganizations([data]);
        setForm((f) => ({ ...f, organizationId: data.id }));
        return api.get('/properties');
      })
      .then(({ data }) => setProperties(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.propertyId) {
      api
        .get(`/units/property/${form.propertyId}`)
        .then(({ data }) => setUnits(data))
        .catch(() => setUnits([]));
    } else {
      setUnits([]);
      setForm((f) => ({ ...f, unitId: '' }));
    }
  }, [form.propertyId]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleClear = () => {
    setForm((f) => ({ ...emptyForm, organizationId: f.organizationId }));
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      setError('First name, last name, email and phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        organizationId: form.organizationId,
      };
      if (form.propertyId) body.propertyId = form.propertyId;
      if (form.unitId) body.unitId = form.unitId;

      await api.post('/tenants', body);
      router.push('/tenants');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to add tenant.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const labelSx = {
    width: 180,
    flexShrink: 0,
    textAlign: 'right' as const,
    pt: 1,
    pr: 3,
    color: 'text.primary',
    fontSize: '0.95rem',
  };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, maxWidth: 760 }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 1 }}>
      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push('/tenants')}
        variant="outlined"
        size="small"
        sx={{
          mb: 2.5,
          borderColor: '#d1d5db',
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 500,
        }}
      >
        Back
      </Button>

      {/* Title */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3.5 }}>
        Tenant Form
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, maxWidth: 760 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Select Property */}
      <Row label="Select Property">
        <TextField
          select
          fullWidth
          size="small"
          value={form.propertyId}
          onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value, unitId: '' }))}
        >
          <MenuItem value="">All Properties</MenuItem>
          {properties.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mt: 0.75, display: 'block', lineHeight: 1.5 }}
        >
          If the property is not available in the list, please go to the{' '}
          <Typography
            component="span"
            variant="caption"
            sx={{ color: '#3b3fd8', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => router.push('/properties')}
          >
            properties page
          </Typography>{' '}
          to add it.
        </Typography>
      </Row>

      {/* Select Unit */}
      <Row label="Select Unit">
        <TextField
          select
          fullWidth
          size="small"
          value={form.unitId}
          onChange={(e) => setForm((f) => ({ ...f, unitId: e.target.value }))}
          disabled={!form.propertyId}
        >
          <MenuItem value="">Select Unit</MenuItem>
          {units.map((u) => (
            <MenuItem key={u.id} value={u.id}>
              {u.unitNumber}
            </MenuItem>
          ))}
        </TextField>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mt: 0.75, display: 'block', lineHeight: 1.5 }}
        >
          If the unit is not available in the list, please go to the{' '}
          <Typography
            component="span"
            variant="caption"
            sx={{ color: '#3b3fd8', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => router.push('/units')}
          >
            units page
          </Typography>{' '}
          to add it.
        </Typography>
      </Row>

      {/* First Name */}
      <Row label="First Name">
        <TextField
          fullWidth
          size="small"
          placeholder="First Name"
          value={form.firstName}
          onChange={set('firstName')}
        />
      </Row>

      {/* Last Name */}
      <Row label="Last Name">
        <TextField
          fullWidth
          size="small"
          placeholder="Last name ..."
          value={form.lastName}
          onChange={set('lastName')}
        />
      </Row>

      {/* Phone Number */}
      <Row label="Phone Number">
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Country flag + code selector */}
          <TextField select size="small" value="+254" sx={{ width: 90 }}>
            <MenuItem value="+254">🇰🇪 +254</MenuItem>
            <MenuItem value="+255">🇹🇿 +255</MenuItem>
            <MenuItem value="+256">🇺🇬 +256</MenuItem>
            <MenuItem value="+1">🇺🇸 +1</MenuItem>
            <MenuItem value="+44">🇬🇧 +44</MenuItem>
          </TextField>
          <TextField
            fullWidth
            size="small"
            placeholder="+254"
            value={form.phone}
            onChange={set('phone')}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mt: 0.75, display: 'block', lineHeight: 1.5 }}
        >
          The phone number should be in international format: country code then phone number.
        </Typography>
      </Row>

      {/* Show More toggle */}
      <Collapse in={showMore}>
        {/* Email */}
        <Row label="Email">
          <TextField
            fullWidth
            size="small"
            type="email"
            placeholder="tenant@email.com"
            value={form.email}
            onChange={set('email')}
          />
        </Row>

        {/* National ID */}
        <Row label="National ID">
          <TextField
            fullWidth
            size="small"
            placeholder="ID number"
            value={form.nationalId}
            onChange={set('nationalId')}
          />
        </Row>

        {/* Emergency Contact */}
        <Row label="Emergency Contact">
          <TextField
            fullWidth
            size="small"
            placeholder="Contact name"
            value={form.emergencyContact}
            onChange={set('emergencyContact')}
          />
        </Row>

        {/* Emergency Phone */}
        <Row label="Emergency Phone">
          <TextField
            fullWidth
            size="small"
            placeholder="+254"
            value={form.emergencyPhone}
            onChange={set('emergencyPhone')}
          />
        </Row>

        {/* Notes */}
        <Row label="Notes">
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            placeholder="Any additional notes..."
            value={form.notes}
            onChange={set('notes')}
          />
        </Row>
      </Collapse>

      {/* Email (visible when showMore is false) */}
      {!showMore && (
        <Row label="Email">
          <TextField
            fullWidth
            size="small"
            type="email"
            placeholder="tenant@email.com"
            value={form.email}
            onChange={set('email')}
          />
        </Row>
      )}

      {/* Show More link */}
      <Box
        sx={{ maxWidth: 760, display: 'flex', justifyContent: 'flex-start', pl: '180px', mb: 3 }}
      >
        <Button
          size="small"
          endIcon={
            <ExpandMoreIcon
              sx={{ transform: showMore ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
            />
          }
          onClick={() => setShowMore((v) => !v)}
          sx={{
            textTransform: 'none',
            color: 'text.primary',
            textDecoration: 'underline',
            fontWeight: 400,
            p: 0,
            minWidth: 0,
          }}
        >
          {showMore ? 'Show Less' : 'Show More'}
        </Button>
      </Box>

      {/* Submit buttons */}
      <Box sx={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            bgcolor: '#3b3fd8',
            '&:hover': { bgcolor: '#2d31b3' },
            py: 1.4,
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
          }}
        >
          Add Tenant
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleClear}
          sx={{
            borderColor: '#d1d5db',
            color: '#3b3fd8',
            py: 1.4,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 1.5,
          }}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
}
