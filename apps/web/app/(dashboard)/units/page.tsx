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
  propertyId: string;
  unitNumber: string;
  floor?: string;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  securityDeposit: number;
  vacant: boolean;
  property?: Property;
}

const emptyForm = {
  propertyId: '',
  unitNumber: '',
  floor: '',
  bedrooms: '1',
  bathrooms: '1',
  monthlyRent: '',
  securityDeposit: '',
};

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/units');
    setUnits(data);
  };

  useEffect(() => {
    load();
    api.get('/properties').then(({ data }) => setProperties(data));
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    try {
      const body = {
        ...form,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseFloat(form.bathrooms),
        monthlyRent: parseFloat(form.monthlyRent),
        securityDeposit: parseFloat(form.securityDeposit),
      };
      if (editing) {
        await api.patch(`/units/${editing.id}`, body);
      } else {
        await api.post('/units', body);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to save unit');
    }
  };

  const handleEdit = (u: Unit) => {
    setEditing(u);
    setForm({
      propertyId: u.propertyId,
      unitNumber: u.unitNumber,
      floor: u.floor || '',
      bedrooms: String(u.bedrooms),
      bathrooms: String(u.bathrooms),
      monthlyRent: String(u.monthlyRent),
      securityDeposit: String(u.securityDeposit),
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this unit?')) return;
    await api.delete(`/units/${id}`);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Units
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
          Add Unit
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Unit #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Floor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Beds</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Baths</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rent</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Deposit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.unitNumber}</TableCell>
                  <TableCell>{u.property?.name || u.propertyId}</TableCell>
                  <TableCell>{u.floor || '-'}</TableCell>
                  <TableCell>{u.bedrooms}</TableCell>
                  <TableCell>{u.bathrooms}</TableCell>
                  <TableCell>KES {Number(u.monthlyRent).toLocaleString()}</TableCell>
                  <TableCell>KES {Number(u.securityDeposit).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.vacant ? 'Vacant' : 'Occupied'}
                      color={u.vacant ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(u)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(u.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {units.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No units found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
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
            fullWidth
            label="Unit Number"
            value={form.unitNumber}
            onChange={handleChange('unitNumber')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Floor"
            value={form.floor}
            onChange={handleChange('floor')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={handleChange('bedrooms')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Bathrooms"
            type="number"
            value={form.bathrooms}
            onChange={handleChange('bathrooms')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Monthly Rent"
            type="number"
            value={form.monthlyRent}
            onChange={handleChange('monthlyRent')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Security Deposit"
            type="number"
            value={form.securityDeposit}
            onChange={handleChange('securityDeposit')}
            required
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
