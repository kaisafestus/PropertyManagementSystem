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
  Chip,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
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
interface Tenant {
  id: string;
  user?: { firstName: string; lastName: string };
}
interface Vendor {
  id: string;
  companyName: string;
}
interface MaintRequest {
  id: string;
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  vendorId?: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  cost?: number;
  createdAt: string;
  property?: Property;
  unit?: Unit;
  tenant?: Tenant;
  vendor?: Vendor;
}

const priorityColors: Record<
  string,
  'default' | 'success' | 'warning' | 'secondary' | 'info' | 'primary'
> = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'warning',
  EMERGENCY: 'secondary',
};

const statusColors: Record<
  string,
  'default' | 'success' | 'warning' | 'secondary' | 'info' | 'primary'
> = {
  OPEN: 'warning',
  ASSIGNED: 'info',
  IN_PROGRESS: 'info',
  WAITING_PARTS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const emptyForm = {
  propertyId: '',
  unitId: '',
  tenantId: '',
  vendorId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  cost: '',
};

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaintRequest | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/maintenance');
    setRequests(data);
  };

  useEffect(() => {
    load();
    api.get('/properties').then(({ data }) => setProperties(data));
    api.get('/tenants').then(({ data }) => setTenants(data));
    api.get('/vendors').then(({ data }) => setVendors(data));
  }, []);

  useEffect(() => {
    if (form.propertyId) {
      api.get(`/units/property/${form.propertyId}`).then(({ data }) => setUnits(data));
    } else {
      setUnits([]);
    }
  }, [form.propertyId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const body: any = {
        propertyId: form.propertyId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
      };
      if (form.unitId) body.unitId = form.unitId;
      if (form.tenantId) body.tenantId = form.tenantId;
      if (form.vendorId) body.vendorId = form.vendorId;
      if (form.cost) body.cost = parseFloat(form.cost);

      if (editing) {
        await api.patch(`/maintenance/${editing.id}`, body);
      } else {
        await api.post('/maintenance', body);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to save request');
    }
  };

  const handleEdit = (r: MaintRequest) => {
    setEditing(r);
    setForm({
      propertyId: r.propertyId,
      unitId: r.unitId || '',
      tenantId: r.tenantId || '',
      vendorId: r.vendorId || '',
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      cost: r.cost ? String(r.cost) : '',
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this request?')) return;
    await api.delete(`/maintenance/${id}`);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Maintenance
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          New Request
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cost</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.property?.name}</TableCell>
                  <TableCell>{r.unit?.unitNumber || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.priority}
                      color={priorityColors[r.priority] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.status?.replace('_', ' ')}
                      color={statusColors[r.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{r.vendor?.companyName || 'Unassigned'}</TableCell>
                  <TableCell>{r.cost ? `KES ${Number(r.cost).toLocaleString()}` : '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(r)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(r.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No maintenance requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Request' : 'New Maintenance Request'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            select
            fullWidth
            label="Property"
            value={form.propertyId}
            onChange={handleChange('propertyId')}
            required
            sx={{ mt: 1, mb: 2 }}
          >
            {properties.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Unit"
            value={form.unitId}
            onChange={handleChange('unitId')}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {units.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.unitNumber}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Tenant"
            value={form.tenantId}
            onChange={handleChange('tenantId')}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">None</MenuItem>
            {tenants.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.user?.firstName} {t.user?.lastName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Vendor"
            value={form.vendorId}
            onChange={handleChange('vendorId')}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {vendors.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.companyName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Title"
            value={form.title}
            onChange={handleChange('title')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Priority"
            value={form.priority}
            onChange={handleChange('priority')}
            sx={{ mb: 2 }}
          >
            {['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'].map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Status"
            value={form.status}
            onChange={handleChange('status')}
            sx={{ mb: 2 }}
          >
            {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CANCELLED'].map(
              (s) => (
                <MenuItem key={s} value={s}>
                  {s.replace('_', ' ')}
                </MenuItem>
              ),
            )}
          </TextField>
          <TextField
            fullWidth
            label="Cost"
            type="number"
            value={form.cost}
            onChange={handleChange('cost')}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
