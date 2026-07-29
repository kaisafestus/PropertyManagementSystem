'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '@/lib/api';

interface Property {
  id: string;
  name: string;
  code: string;
  description?: string;
  addressLine1: string;
  city: string;
  county: string;
  postalCode?: string;
  totalUnits: number;
  active: boolean;
}

const emptyForm = {
  name: '',
  code: '',
  description: '',
  addressLine1: '',
  city: '',
  county: '',
  postalCode: '',
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/properties');
    setProperties(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (editing) {
        await api.patch(`/properties/${editing.id}`, form);
      } else {
        await api.post('/properties', form);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to save property');
    }
  };

  const handleEdit = (p: Property) => {
    setEditing(p);
    setForm({
      name: p.name,
      code: p.code,
      description: p.description || '',
      addressLine1: p.addressLine1,
      city: p.city,
      county: p.county,
      postalCode: p.postalCode || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property?')) return;
    await api.delete(`/properties/${id}`);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Properties
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
          Add Property
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Units</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.addressLine1}</TableCell>
                  <TableCell>{p.city}</TableCell>
                  <TableCell>{p.totalUnits}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.active ? 'Active' : 'Inactive'}
                      color={p.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(p)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(p.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {properties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No properties found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Property' : 'Add Property'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Name"
            value={form.name}
            onChange={handleChange('name')}
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Code"
            value={form.code}
            onChange={handleChange('code')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Address"
            value={form.addressLine1}
            onChange={handleChange('addressLine1')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="City"
            value={form.city}
            onChange={handleChange('city')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="County"
            value={form.county}
            onChange={handleChange('county')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Postal Code"
            value={form.postalCode}
            onChange={handleChange('postalCode')}
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
