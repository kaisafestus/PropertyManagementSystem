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
import { Add, Edit, Visibility } from '@mui/icons-material';
import api from '@/lib/api';

interface Tenant {
  id: string;
  user?: { firstName: string; lastName: string };
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
interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  amount: number;
  tax?: number;
  totalAmount: number;
  description: string;
  status: string;
  dueDate: string;
  issueDate: string;
  tenant?: Tenant;
  property?: Property;
  unit?: Unit;
}

const statusColors: Record<
  string,
  'default' | 'success' | 'warning' | 'secondary' | 'info' | 'primary'
> = {
  DRAFT: 'default',
  SENT: 'info',
  PAID: 'success',
  PARTIAL: 'warning',
  OVERDUE: 'secondary',
  CANCELLED: 'default',
};

const emptyForm = {
  tenantId: '',
  propertyId: '',
  unitId: '',
  invoiceNumber: '',
  dueDate: '',
  amount: '',
  tax: '',
  description: '',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/financial/invoices');
    setInvoices(data);
  };

  useEffect(() => {
    load();
    api.get('/tenants').then(({ data }) => setTenants(data));
    api.get('/properties').then(({ data }) => setProperties(data));
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
      const body = {
        ...form,
        amount: parseFloat(form.amount),
        tax: form.tax ? parseFloat(form.tax) : undefined,
      };
      if (editing) {
        await api.patch(`/financial/invoices/${editing.id}`, body);
      } else {
        await api.post('/financial/invoices', body);
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to save invoice');
    }
  };

  const handleEdit = (inv: Invoice) => {
    setEditing(inv);
    setForm({
      tenantId: inv.tenantId,
      propertyId: inv.propertyId,
      unitId: inv.unitId,
      invoiceNumber: inv.invoiceNumber,
      dueDate: inv.dueDate?.split('T')[0] || '',
      amount: String(inv.amount),
      tax: inv.tax ? String(inv.tax) : '',
      description: inv.description,
    });
    setOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Invoices
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
          Create Invoice
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tenant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell>
                    {inv.tenant?.user?.firstName} {inv.tenant?.user?.lastName}
                  </TableCell>
                  <TableCell>KES {Number(inv.amount).toLocaleString()}</TableCell>
                  <TableCell>KES {Number(inv.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={inv.status}
                      color={statusColors[inv.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(inv)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            select
            fullWidth
            label="Tenant"
            value={form.tenantId}
            onChange={handleChange('tenantId')}
            required
            sx={{ mt: 1, mb: 2 }}
          >
            {tenants.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.user?.firstName} {t.user?.lastName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Property"
            value={form.propertyId}
            onChange={handleChange('propertyId')}
            required
            sx={{ mb: 2 }}
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
            required
            sx={{ mb: 2 }}
          >
            {units.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.unitNumber}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Invoice Number"
            value={form.invoiceNumber}
            onChange={handleChange('invoiceNumber')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={handleChange('dueDate')}
            required
            sx={{ mb: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={form.amount}
            onChange={handleChange('amount')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Tax"
            type="number"
            value={form.tax}
            onChange={handleChange('tax')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
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
