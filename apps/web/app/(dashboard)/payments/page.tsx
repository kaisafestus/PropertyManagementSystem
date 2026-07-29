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
import { Add, Edit } from '@mui/icons-material';
import api from '@/lib/api';

interface Payment {
  id: string;
  invoiceId: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  amount: number;
  method: string;
  reference?: string;
  status: string;
  paidAt?: string;
  notes?: string;
  tenant?: { user?: { firstName: string; lastName: string } };
  invoice?: { invoiceNumber: string };
}

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
  totalAmount: number;
  status: string;
}

const statusColors: Record<
  string,
  'default' | 'success' | 'warning' | 'secondary' | 'info' | 'primary'
> = {
  PENDING: 'warning',
  PAID: 'success',
  PARTIAL: 'info',
  OVERDUE: 'secondary',
  FAILED: 'secondary',
  REFUNDED: 'default',
};

const methods = ['BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'M_PESA', 'ACH', 'CASH', 'OTHER'];

const emptyForm = {
  invoiceId: '',
  tenantId: '',
  propertyId: '',
  unitId: '',
  amount: '',
  method: 'M_PESA',
  reference: '',
  notes: '',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/financial/payments');
    setPayments(data);
  };

  useEffect(() => {
    load();
    api.get('/tenants').then(({ data }) => setTenants(data));
    api.get('/properties').then(({ data }) => setProperties(data));
    api.get('/financial/invoices').then(({ data }) => setInvoices(data));
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

  const handleInvoiceSelect = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setForm({
        ...form,
        invoiceId,
        tenantId: inv.tenantId,
        propertyId: inv.propertyId,
        unitId: inv.unitId,
        amount: String(inv.totalAmount),
      });
    } else {
      setForm({ ...form, invoiceId });
    }
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await api.post('/financial/payments', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to record payment');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Payments
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          Record Payment
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tenant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.invoice?.invoiceNumber || '-'}</TableCell>
                  <TableCell>
                    {p.tenant?.user?.firstName} {p.tenant?.user?.lastName}
                  </TableCell>
                  <TableCell>KES {Number(p.amount).toLocaleString()}</TableCell>
                  <TableCell>{p.method?.replace('_', ' ')}</TableCell>
                  <TableCell>{p.reference || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      color={statusColors[p.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            select
            fullWidth
            label="Invoice"
            value={form.invoiceId}
            onChange={(e) => handleInvoiceSelect(e.target.value)}
            required
            sx={{ mt: 1, mb: 2 }}
          >
            {invoices
              .filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED')
              .map((inv) => (
                <MenuItem key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - KES {Number(inv.totalAmount).toLocaleString()}
                </MenuItem>
              ))}
          </TextField>
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
            select
            fullWidth
            label="Payment Method"
            value={form.method}
            onChange={handleChange('method')}
            required
            sx={{ mb: 2 }}
          >
            {methods.map((m) => (
              <MenuItem key={m} value={m}>
                {m.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Reference"
            value={form.reference}
            onChange={handleChange('reference')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Notes"
            value={form.notes}
            onChange={handleChange('notes')}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
