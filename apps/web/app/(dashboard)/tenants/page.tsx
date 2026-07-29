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
interface Tenant {
  id: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/tenants');
    setTenants(data);
  };

  useEffect(() => {
    load();
    api
      .get('/users')
      .then(({ data }) =>
        setUsers(data.filter((u: User) => u.role === 'TENANT' || u.role === 'APPLICANT')),
      );
  }, []);

  const handleSubmit = async () => {
    setError('');
    try {
      await api.post('/tenants', form);
      setOpen(false);
      setForm({ userId: '' });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to create tenant');
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
                  <TableCell colSpan={5} align="center">
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
            label="Select User"
            value={form.userId}
            onChange={(e) => setForm({ userId: e.target.value })}
            required
            sx={{ mt: 1 }}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.email})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.userId}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
