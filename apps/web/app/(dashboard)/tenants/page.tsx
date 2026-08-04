'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import api from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}
interface Property {
  id: string;
  name: string;
}
interface Unit {
  id: string;
  unitNumber: string;
  propertyId: string;
}
interface Tenant {
  id: string;
  userId: string;
  user?: User;
  property?: Property;
  unit?: Unit;
  createdAt: string;
}
interface Organization {
  id: string;
  name: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organizationId: '',
    propertyId: '',
    unitId: '',
  });
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/tenants');
    setTenants(data);
  };

  useEffect(() => {
    load();
    api.get('/organizations/current').then(({ data }) => {
      setOrganizations([data]);
      setForm((f) => ({ ...f, organizationId: data.id }));
      api.get('/properties').then(({ data: props }) => setProperties(props));
    });
  }, []);

  useEffect(() => {
    if (form.propertyId) {
      api.get(`/units/property/${form.propertyId}`).then(({ data }) => setUnits(data));
    } else {
      setUnits([]);
    }
  }, [form.propertyId]);

  const handleSubmit = async () => {
    setError('');
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.organizationId
    ) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const body: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        organizationId: form.organizationId,
      };
      if (form.propertyId) body.propertyId = form.propertyId;
      if (form.unitId) body.unitId = form.unitId;

      await api.post('/tenants', body);
      setOpen(false);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organizationId: form.organizationId,
        propertyId: '',
        unitId: '',
      });
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg[0]);
      } else if (typeof msg === 'string') {
        setError(msg);
      } else {
        setError('Failed to create tenant');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tenant?')) return;
    await api.delete(`/tenants/${id}`);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Tenants
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Add Tenant
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    {t.user?.firstName} {t.user?.lastName}
                  </TableCell>
                  <TableCell>{t.user?.email}</TableCell>
                  <TableCell>{t.user?.phone || '-'}</TableCell>
                  <TableCell>{t.property?.name || '-'}</TableCell>
                  <TableCell>{t.unit?.unitNumber || '-'}</TableCell>
                  <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDelete(t.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No tenants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Tenant</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            select
            fullWidth
            label="Organization"
            value={form.organizationId}
            onChange={(e) =>
              setForm({ ...form, organizationId: e.target.value, propertyId: '', unitId: '' })
            }
            required
            sx={{ mt: 1, mb: 2 }}
          >
            {organizations.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
          </Box>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Property"
            value={form.propertyId}
            onChange={(e) => setForm({ ...form, propertyId: e.target.value, unitId: '' })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {properties.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Unit"
            value={form.unitId}
            onChange={(e) => setForm({ ...form, unitId: e.target.value })}
            sx={{ mb: 2 }}
            disabled={!form.propertyId || units.length === 0}
          >
            <MenuItem value="">None</MenuItem>
            {units.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.unitNumber}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
