'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import { ArrowBack as BackIcon, Add as AddIcon, Info as InfoIcon } from '@mui/icons-material';
import api from '@/lib/api';

interface Property {
  id: string;
  name: string;
}

interface RecurringBill {
  billType: string;
  amount: string;
}

const BILL_TYPES = [
  'Water',
  'Electricity',
  'Garbage',
  'Security',
  'Internet',
  'Service Charge',
  'Other',
];

const emptyForm = {
  propertyId: '',
  unitNumber: '',
  monthlyRent: '',
  taxRate: '',
  notes: '',
};

export default function AddUnitPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [properties, setProperties] = useState<Property[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([
    { billType: '', amount: '' },
  ]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => {});
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setBill =
    (index: number, field: keyof RecurringBill) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setRecurringBills((prev) =>
        prev.map((b, i) => (i === index ? { ...b, [field]: e.target.value } : b)),
      );
    };

  const addBillRow = () => setRecurringBills((prev) => [...prev, { billType: '', amount: '' }]);

  const handleClear = () => {
    setForm(emptyForm);
    setRecurringBills([{ billType: '', amount: '' }]);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.propertyId) {
      setError('Please select a property.');
      return;
    }
    if (!form.unitNumber.trim()) {
      setError('Unit ID/Name is required.');
      return;
    }
    if (!form.monthlyRent) {
      setError('Rent amount is required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/units', {
        propertyId: form.propertyId,
        unitNumber: form.unitNumber.trim(),
        monthlyRent: parseFloat(form.monthlyRent),
        securityDeposit: 0,
        bedrooms: 1,
        bathrooms: 1,
        ...(form.taxRate ? { taxRate: parseFloat(form.taxRate) } : {}),
        ...(form.notes ? { notes: form.notes } : {}),
      });
      router.push('/units');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to add unit.');
    } finally {
      setSubmitting(false);
    }
  };

  const labelSx = {
    width: 200,
    flexShrink: 0,
    textAlign: 'right' as const,
    pt: 1,
    pr: 3,
    color: 'text.primary',
    fontSize: '0.95rem',
  };

  const Row = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, maxWidth: 820 }}>
      <Box
        component="div"
        sx={{
          ...labelSx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.5,
        }}
      >
        {typeof label === 'string' ? (
          <Typography component="span" sx={{ fontSize: '0.95rem', textAlign: 'right' }}>
            {label}
          </Typography>
        ) : (
          label
        )}
      </Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', px: 2, py: 1 }}>
      {/* Back */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push('/units')}
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
        Unit Form
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, maxWidth: 820 }} onClose={() => setError('')}>
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
          onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
        >
          <MenuItem value="">All Properties</MenuItem>
          {properties.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
      </Row>

      {/* Unit ID/Name */}
      <Row label="Unit ID/Name">
        <TextField
          fullWidth
          size="small"
          placeholder="Unit ID/Name ..."
          value={form.unitNumber}
          onChange={set('unitNumber')}
        />
      </Row>

      {/* Rent Amount */}
      <Row label="Rent Amount">
        <TextField
          fullWidth
          size="small"
          placeholder="rent amount ..."
          type="number"
          value={form.monthlyRent}
          onChange={set('monthlyRent')}
        />
      </Row>

      {/* Tax Rate */}
      <Row label="Tax Rate % (optional)">
        <TextField
          fullWidth
          size="small"
          placeholder="tax rate ..."
          type="number"
          value={form.taxRate}
          onChange={set('taxRate')}
        />
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mt: 0.75, display: 'block', lineHeight: 1.6 }}
        >
          Residential units tax rate is usually 7.5%. Commercial units tax rate is usually 16%.
        </Typography>
      </Row>

      {/* Other Recurring Bills */}
      <Row
        label={
          <Box
            component="div"
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
          >
            <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography component="span" sx={{ fontSize: '0.95rem' }}>
                Other Recurring Bills
              </Typography>
              <InfoIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            </Box>
            <Typography component="span" variant="caption" color="text.secondary">
              (optional)
            </Typography>
          </Box>
        }
      >
        {recurringBills.map((bill, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
            <TextField
              select
              size="small"
              value={bill.billType}
              onChange={(e) =>
                setBill(idx, 'billType')({ target: { value: e.target.value } } as any)
              }
              sx={{ flex: 1 }}
              placeholder="Select bill type"
            >
              <MenuItem value="">Select bill type</MenuItem>
              {BILL_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              placeholder="amount"
              type="number"
              value={bill.amount}
              onChange={setBill(idx, 'amount')}
              sx={{ flex: 1 }}
            />
            {idx === recurringBills.length - 1 && (
              <IconButton
                onClick={addBillRow}
                size="small"
                sx={{
                  border: '1px solid #d1d5db',
                  borderRadius: 1,
                  p: 0.75,
                  color: 'text.primary',
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Row>

      {/* Notes */}
      <Row label="Notes (optional)">
        <TextField
          fullWidth
          size="small"
          multiline
          rows={3}
          placeholder="notes ..."
          value={form.notes}
          onChange={set('notes')}
        />
      </Row>

      {/* Submit buttons */}
      <Box sx={{ maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
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
          Add Unit
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
