'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Checkbox,
  TextField,
  MenuItem,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
  Menu,
  Divider,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as MinusIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  id: string;
  invoiceId?: string;
  tenantId?: string;
  propertyId?: string;
  unitId?: string;
  amount: number;
  method: string;
  reference?: string;
  status: string;
  paidAt?: string;
  createdAt?: string;
  notes?: string;
  tenant?: { user?: { firstName: string; lastName: string } };
  property?: { name: string };
  unit?: { unitNumber: string };
  invoice?: { invoiceNumber: string };
}

interface Property {
  id: string;
  name: string;
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

interface Tenant {
  id: string;
  user?: { firstName: string; lastName: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shortId = (id: string) => id.slice(-8);

const fmtDate = (d?: string) => {
  if (!d) return '-';
  return new Date(d).toISOString().slice(0, 10);
};

const fmtAmount = (n: number) =>
  Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  CONFIRMED: { color: '#166534', bg: '#dcfce7' },
  PAID: { color: '#166534', bg: '#dcfce7' },
  PENDING: { color: '#92400e', bg: '#fef3c7' },
  DRAFT: { color: '#6b7280', bg: '#f3f4f6' },
  FAILED: { color: '#991b1b', bg: '#fee2e2' },
  REFUNDED: { color: '#1e40af', bg: '#dbeafe' },
};

const METHODS = ['BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'M_PESA', 'ACH', 'CASH', 'OTHER'];

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

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  statuses: string[];
  sources: string[];
  propertyId: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  properties: Property[];
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          py: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        {open ? (
          <ExpandLessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        ) : (
          <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        )}
      </Box>
      <Collapse in={open}>{children}</Collapse>
      <Divider />
    </Box>
  );
}

function FilterPanel({ filters, onChange, properties }: FilterPanelProps) {
  const set = (key: keyof FilterState, val: unknown) => onChange({ ...filters, [key]: val });

  const toggleStatus = (s: string) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((x) => x !== s)
      : [...filters.statuses, s];
    set('statuses', next);
  };

  const toggleSource = (s: string) => {
    const next = filters.sources.includes(s)
      ? filters.sources.filter((x) => x !== s)
      : [...filters.sources, s];
    set('sources', next);
  };

  return (
    <Card
      sx={{
        width: 240,
        flexShrink: 0,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        p: 2,
        alignSelf: 'flex-start',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
          Filters
        </Typography>
        <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
      </Box>

      {/* Search */}
      <TextField
        size="small"
        placeholder="Type to search..."
        fullWidth
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        sx={{ mb: 1.5 }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Date */}
      <FilterSection title="Date">
        <TextField
          size="small"
          fullWidth
          placeholder="Start date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => set('dateFrom', e.target.value)}
          sx={{ mb: 1 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          fullWidth
          placeholder="End date"
          type="date"
          value={filters.dateTo}
          onChange={(e) => set('dateTo', e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </FilterSection>

      {/* Amount */}
      <FilterSection title="Amount">
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="min"
            value={filters.amountMin}
            onChange={(e) => set('amountMin', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            placeholder="max"
            value={filters.amountMax}
            onChange={(e) => set('amountMax', e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>
      </FilterSection>

      {/* Payment status */}
      <FilterSection title="Payment status">
        {['draft', 'confirmed'].map((s) => (
          <FormControlLabel
            key={s}
            control={
              <Checkbox
                size="small"
                checked={filters.statuses.includes(s.toUpperCase())}
                onChange={() => toggleStatus(s.toUpperCase())}
              />
            }
            label={<Typography variant="body2">{s}</Typography>}
            sx={{ display: 'flex', ml: 0 }}
          />
        ))}
      </FilterSection>

      {/* Payment source */}
      <FilterSection title="Payment source">
        {['mpesa', 'copilot', 'bank statement', 'manual'].map((src) => (
          <FormControlLabel
            key={src}
            control={
              <Checkbox
                size="small"
                checked={filters.sources.includes(src)}
                onChange={() => toggleSource(src)}
              />
            }
            label={<Typography variant="body2">{src}</Typography>}
            sx={{ display: 'flex', ml: 0 }}
          />
        ))}
      </FilterSection>

      {/* Property / Unit */}
      <FilterSection title="Property / Unit">
        <FormControl size="small" fullWidth>
          <Select
            value={filters.propertyId}
            onChange={(e) => set('propertyId', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Properties</MenuItem>
            {properties.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterSection>

      {/* Unassigned */}
      <FilterSection title="Unassigned payments">
        <Typography variant="caption" color="text.secondary">
          No unassigned payments
        </Typography>
      </FilterSection>
    </Card>
  );
}

// ─── Options Dropdown ─────────────────────────────────────────────────────────

function OptionsMenu({
  paymentId,
  onDelete,
}: {
  paymentId: string;
  onDelete: (id: string) => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          borderColor: '#d1d5db',
          color: 'text.primary',
          fontSize: '0.78rem',
          textTransform: 'none',
          py: 0.4,
          px: 1.2,
          minWidth: 90,
        }}
      >
        Options
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 140, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } } }}
      >
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          View details
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          Send receipt
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          Edit
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(paymentId);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [recordOpen, setRecordOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    statuses: [],
    sources: [],
    propertyId: '',
  });

  // Load data
  const load = async () => {
    try {
      const { data } = await api.get('/financial/payments');
      setPayments(data);
    } catch {}
  };

  useEffect(() => {
    load();
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => {});
    api
      .get('/financial/invoices')
      .then(({ data }) => setInvoices(data))
      .catch(() => {});
    api
      .get('/tenants')
      .then(({ data }) => setTenants(data))
      .catch(() => {});
  }, []);

  // Filtered payments
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const name =
        `${p.tenant?.user?.firstName ?? ''} ${p.tenant?.user?.lastName ?? ''}`.toLowerCase();
      const ref = (p.reference ?? '').toLowerCase();
      const id = p.id.toLowerCase();
      const search = filters.search.toLowerCase();
      if (search && !name.includes(search) && !ref.includes(search) && !id.includes(search))
        return false;
      if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
      if (filters.propertyId && p.propertyId !== filters.propertyId) return false;
      if (filters.amountMin && Number(p.amount) < Number(filters.amountMin)) return false;
      if (filters.amountMax && Number(p.amount) > Number(filters.amountMax)) return false;
      if (filters.dateFrom) {
        const d = p.paidAt ?? p.createdAt;
        if (!d || new Date(d) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        const d = p.paidAt ?? p.createdAt;
        if (!d || new Date(d) > new Date(filters.dateTo)) return false;
      }
      return true;
    });
  }, [payments, filters]);

  const total = filtered.reduce((s, p) => s + Number(p.amount), 0);

  // Selection
  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((p) => p.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/financial/payments/${id}`);
      load();
    } catch {}
  };

  // Record payment submit
  const handleSubmit = async () => {
    setFormError('');
    try {
      await api.post('/financial/payments', { ...form, amount: parseFloat(form.amount) });
      setRecordOpen(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record payment');
    }
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
        <Button
          variant="contained"
          onClick={() => {
            setForm(emptyForm);
            setRecordOpen(true);
          }}
          sx={{
            bgcolor: '#3b3fd8',
            '&:hover': { bgcolor: '#2d31b3' },
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Record Payment
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: '#d1d5db',
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Upload Bank Statement
        </Button>
      </Box>

      {/* Body: filter panel + main content */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* Left: Filter Panel */}
        <FilterPanel filters={filters} onChange={setFilters} properties={properties} />

        {/* Right: Summary + Table */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Summary card */}
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              p: 2.5,
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                Summary
              </Typography>
              <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
            </Box>
            <Box sx={{ textAlign: 'center', py: 1.5 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}
              >
                <Divider sx={{ flex: 1, mr: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Divider sx={{ flex: 1, ml: 2 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8', my: 0.75 }}>
                {fmtAmount(total)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (KES)
              </Typography>
            </Box>
          </Card>

          {/* Payments table card */}
          <Card
            sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
          >
            <Box sx={{ p: 2, pb: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  Payments
                </Typography>
                <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
              </Box>

              {/* Table action bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SendIcon fontSize="small" />}
                  disabled={selected.length === 0}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#d1d5db',
                    color: 'text.primary',
                    fontSize: '0.82rem',
                  }}
                >
                  Send Receipt(s)
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    disabled={selected.length === 0}
                    onClick={() => selected.forEach(handleDelete)}
                    sx={{ border: '1px solid #d1d5db', borderRadius: 1, p: 0.75 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon fontSize="small" />}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#d1d5db',
                      color: 'text.primary',
                      fontSize: '0.82rem',
                    }}
                  >
                    Download Payments
                  </Button>
                </Box>
              </Box>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={selected.length > 0 && !allSelected}
                        onChange={toggleAll}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        color: 'text.secondary',
                        width: 30,
                      }}
                    />
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Date ↕
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Payment ID/Number
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Tenant
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Property (Unit)
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        color: 'text.secondary',
                        textAlign: 'right',
                      }}
                    >
                      Amount (KES)
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Options
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((p) => {
                    const isSelected = selected.includes(p.id);
                    const statusStyle = STATUS_COLORS[p.status] ?? {
                      color: '#6b7280',
                      bg: '#f3f4f6',
                    };
                    const tenantName = p.tenant?.user
                      ? `${p.tenant.user.firstName} ${p.tenant.user.lastName}`
                      : '-';
                    const propertyUnit = p.property
                      ? `${p.property.name}${p.unit ? `(${p.unit.unitNumber})` : ''}`
                      : '-';

                    return (
                      <TableRow
                        key={p.id}
                        hover
                        selected={isSelected}
                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 2 }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => toggleOne(p.id)}
                          />
                        </TableCell>
                        <TableCell
                          sx={{ color: 'text.secondary', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          +
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '0.82rem',
                            color: 'text.secondary',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fmtDate(p.paidAt ?? p.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '0.82rem',
                              color: '#3b3fd8',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontFamily: 'monospace',
                            }}
                          >
                            {shortId(p.id)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{tenantName}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                          {propertyUnit}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', color: 'text.secondary', mb: 0.3 }}
                            >
                              {p.status.toLowerCase()}
                            </Typography>
                            <Chip
                              label="SAMPLE"
                              size="small"
                              sx={{
                                bgcolor: '#f97316',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                height: 18,
                                borderRadius: '3px',
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}
                        >
                          {fmtAmount(p.amount)}
                        </TableCell>
                        <TableCell>
                          <OptionsMenu paymentId={p.id} onDelete={handleDelete} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>

      {/* Record Payment Dialog */}
      <Dialog open={recordOpen} onClose={() => setRecordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Record Payment</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
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
                  {inv.invoiceNumber} — KES {fmtAmount(inv.totalAmount)}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Payment Method"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            required
            sx={{ mb: 2 }}
          >
            {METHODS.map((m) => (
              <MenuItem key={m} value={m}>
                {m.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Reference"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRecordOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#3b3fd8', '&:hover': { bgcolor: '#2d31b3' } }}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
