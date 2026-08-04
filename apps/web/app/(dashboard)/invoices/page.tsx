'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
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

interface Tenant {
  id: string;
  user?: { firstName: string; lastName: string };
  property?: { id: string; name: string };
  unit?: { id: string; unitNumber: string };
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
  totalAmount: number;
  description: string;
  status: string;
  dueDate: string;
  issueDate: string;
  createdAt?: string;
  tenant?: Tenant;
  property?: Property;
  unit?: Unit;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shortId = (id: string) => id.slice(-8);

const fmtDate = (d?: string) => {
  if (!d) return '-';
  return new Date(d).toISOString().slice(0, 10);
};

const fmtAmount = (n: number) =>
  Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'draft',
  SENT: 'open',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'void',
  UNCOLLECTIBLE: 'uncollectible',
};

const emptyForm = {
  tenantId: '',
  propertyId: '',
  unitId: '',
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  amount: '',
  description: '',
  status: 'DRAFT',
};

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  propertyId: string;
  item: string;
  statuses: string[];
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <Box sx={{ mb: 1 }}>
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
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {open ? (
          <ExpandLessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        ) : (
          <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        )}
      </Box>
      <Collapse in={open}>{children}</Collapse>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}

const ALL_STATUSES = ['draft', 'void', 'open', 'partial', 'paid', 'uncollectible', 'credit-note'];
const DEFAULT_STATUSES = ['open', 'partial', 'paid'];

function FilterPanel({
  filters,
  onChange,
  properties,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  properties: Property[];
}) {
  const set = (key: keyof FilterState, val: unknown) => onChange({ ...filters, [key]: val });

  const toggleStatus = (s: string) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((x) => x !== s)
      : [...filters.statuses, s];
    set('statuses', next);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
          Filters
        </Typography>
        <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
      </Box>

      <TextField
        size="small"
        fullWidth
        placeholder="Type to search..."
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

      <FilterSection title="Property / Unit">
        <FormControl size="small" fullWidth>
          <Select
            value={filters.propertyId}
            onChange={(e) => set('propertyId', e.target.value as string)}
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

      <FilterSection title="Invoice Item">
        <FormControl size="small" fullWidth>
          <Select
            value={filters.item}
            onChange={(e) => set('item', e.target.value as string)}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="rent">Rent</MenuItem>
            <MenuItem value="water">Water</MenuItem>
            <MenuItem value="electricity">Electricity</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </FilterSection>

      <FilterSection title="Invoice Status">
        {ALL_STATUSES.map((s) => (
          <FormControlLabel
            key={s}
            control={
              <Checkbox
                size="small"
                checked={filters.statuses.includes(s)}
                onChange={() => toggleStatus(s)}
                sx={{ '&.Mui-checked': { color: '#3b3fd8' } }}
              />
            }
            label={<Typography variant="body2">{s}</Typography>}
            sx={{ display: 'flex', ml: 0 }}
          />
        ))}
      </FilterSection>
    </Card>
  );
}

// ─── Options Menu ─────────────────────────────────────────────────────────────

function OptionsMenu({
  invoiceId,
  onEdit,
  onDelete,
}: {
  invoiceId: string;
  onEdit: () => void;
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
            onEdit();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          Send invoice
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          Record payment
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          Download PDF
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(invoiceId);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── More Options Menu ────────────────────────────────────────────────────────

function MoreOptionsMenu({ onAction }: { onAction: (label: string) => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const actions = [
    'Generate Bulk Invoices',
    'New Bulk Add Invoices',
    'Generate Rent Invoices',
    'Generate Other Recurring Bills Invoices',
    'Generate Penalty Invoices',
    'Generate Custom Penalty Invoices',
  ];
  return (
    <>
      <Button
        variant="outlined"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          borderColor: '#d1d5db',
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 600,
          px: 2,
        }}
      >
        More Options
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {actions.map((a) => (
          <MenuItem
            key={a}
            dense
            onClick={() => {
              setAnchor(null);
              onAction(a);
            }}
          >
            {a}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    propertyId: '',
    item: '',
    statuses: [...DEFAULT_STATUSES],
  });

  const load = async () => {
    try {
      const { data } = await api.get('/financial/invoices');
      setInvoices(data);
    } catch {
      setInvoices([]);
    }
  };

  useEffect(() => {
    load();
    api
      .get('/tenants')
      .then(({ data }) => setTenants(data))
      .catch(() => {});
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.propertyId) {
      api
        .get(`/units/property/${form.propertyId}`)
        .then(({ data }) => setUnits(data))
        .catch(() => {});
    } else {
      setUnits([]);
    }
  }, [form.propertyId]);

  // Filtered
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const name =
        `${inv.tenant?.user?.firstName ?? ''} ${inv.tenant?.user?.lastName ?? ''}`.toLowerCase();
      const num = (inv.invoiceNumber ?? '').toLowerCase();
      const desc = (inv.description ?? '').toLowerCase();
      const search = filters.search.toLowerCase();
      if (search && !name.includes(search) && !num.includes(search) && !desc.includes(search))
        return false;
      if (filters.propertyId && inv.propertyId !== filters.propertyId) return false;
      if (filters.statuses.length) {
        const label = STATUS_LABELS[inv.status] ?? inv.status.toLowerCase();
        if (!filters.statuses.includes(label)) return false;
      }
      if (filters.dateFrom && inv.issueDate && new Date(inv.issueDate) < new Date(filters.dateFrom))
        return false;
      if (filters.dateTo && inv.issueDate && new Date(inv.issueDate) > new Date(filters.dateTo))
        return false;
      return true;
    });
  }, [invoices, filters]);

  const total = filtered.reduce((s, inv) => s + Number(inv.totalAmount || inv.amount || 0), 0);

  // Selection
  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((i) => i.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Delete
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/financial/invoices/${id}`);
      load();
    } catch {}
  };

  // Bulk generate
  const handleBulkAction = async (label: string) => {
    setPageError('');
    setSuccessMsg('');
    try {
      const eligible = tenants.filter((t) => t.property?.id && t.unit?.id);
      if (!eligible.length) {
        setPageError('No tenants with assigned units.');
        return;
      }
      const count = label.toLowerCase().includes('bulk') ? 3 : 2;
      const prefix = label.toLowerCase().includes('penalty')
        ? 'PEN'
        : label.toLowerCase().includes('other')
          ? 'BILL'
          : 'INV';
      const reqs = Array.from({ length: count }, (_, i) => {
        const t = eligible[i % eligible.length]!;
        const due = new Date();
        due.setDate(due.getDate() + 12 + i);
        return api.post('/financial/invoices', {
          tenantId: t.id,
          propertyId: t.property?.id,
          unitId: t.unit?.id,
          invoiceNumber: `${prefix}-${Date.now()}-${i}`,
          dueDate: due.toISOString().split('T')[0],
          amount: 5000 + i * 1000,
          description: label,
        });
      });
      await Promise.all(reqs);
      setSuccessMsg(`${label} created successfully.`);
      load();
    } catch {
      setPageError('Could not generate invoice batch.');
    }
  };

  // Form helpers
  const handleTenantChange = (tenantId: string) => {
    const t = tenants.find((x) => x.id === tenantId);
    if (t) {
      setForm({ ...form, tenantId, propertyId: t.property?.id || '', unitId: t.unit?.id || '' });
      if (t.property?.id)
        api
          .get(`/units/property/${t.property.id}`)
          .then(({ data }) => setUnits(data))
          .catch(() => {});
    } else {
      setForm({ ...form, tenantId, propertyId: '', unitId: '' });
    }
  };

  const hc =
    (field: string) => (e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) =>
      setForm({ ...form, [field]: e.target.value });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setOpen(true);
  };
  const openEdit = (inv: Invoice) => {
    setEditing(inv);
    setForm({
      tenantId: inv.tenantId,
      propertyId: inv.propertyId,
      unitId: inv.unitId,
      invoiceNumber: inv.invoiceNumber,
      issueDate: inv.issueDate?.split('T')[0] || '',
      dueDate: inv.dueDate?.split('T')[0] || '',
      amount: String(inv.amount),
      description: inv.description,
      status: inv.status || 'DRAFT',
    });
    setFormError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (
      !form.tenantId ||
      !form.propertyId ||
      !form.unitId ||
      !form.invoiceNumber ||
      !form.dueDate ||
      !form.amount
    ) {
      setFormError('Please fill in all required fields');
      return;
    }
    try {
      const body = { ...form, amount: parseFloat(form.amount), status: form.status || 'DRAFT' };
      if (editing) await api.patch(`/financial/invoices/${editing.id}`, body);
      else await api.post('/financial/invoices', body);
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFormError(
        Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to save invoice',
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {pageError && (
        <Alert severity="error" onClose={() => setPageError('')}>
          {pageError}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Top buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            bgcolor: '#3b3fd8',
            '&:hover': { bgcolor: '#2d31b3' },
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Add Invoice
        </Button>
        <MoreOptionsMenu onAction={handleBulkAction} />
      </Box>

      {/* Body */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* Filter panel */}
        <FilterPanel filters={filters} onChange={setFilters} properties={properties} />

        {/* Right column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Summary */}
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

          {/* Invoices table */}
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
                  Invoices
                </Typography>
                <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
              </Box>
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
                  Send Invoices
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
                    Download Invoices
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
                      Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Invoice ID/Number
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Tenant
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Item
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
                      Amount
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Options
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((inv) => {
                    const isSelected = selected.includes(inv.id);
                    const tenantName = inv.tenant?.user
                      ? `${inv.tenant.user.firstName} ${inv.tenant.user.lastName}`
                      : '-';
                    const propertyUnit = inv.property
                      ? `${inv.property.name}${inv.unit ? ` (${inv.unit.unitNumber})` : ''}`
                      : '-';
                    const statusLabel = STATUS_LABELS[inv.status] ?? inv.status.toLowerCase();
                    const item = inv.description?.toLowerCase().includes('water')
                      ? 'water'
                      : inv.description?.toLowerCase().includes('rent')
                        ? 'rent'
                        : inv.description?.toLowerCase().includes('electric')
                          ? 'electricity'
                          : 'other';

                    return (
                      <TableRow
                        key={inv.id}
                        hover
                        selected={isSelected}
                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 2 }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => toggleOne(inv.id)}
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
                          {fmtDate(inv.issueDate ?? inv.createdAt)}
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
                            {shortId(inv.id)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{tenantName}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                          {item}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                          {propertyUnit}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', color: 'text.secondary', mb: 0.3 }}
                            >
                              {statusLabel}
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
                          {fmtAmount(inv.totalAmount || inv.amount)}
                        </TableCell>
                        <TableCell>
                          <OptionsMenu
                            invoiceId={inv.id}
                            onEdit={() => openEdit(inv)}
                            onDelete={handleDelete}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        align="center"
                        sx={{ py: 5, color: 'text.secondary' }}
                      >
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? 'Edit Invoice' : 'Add Invoice'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Tenant"
                value={form.tenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                required
              >
                {tenants.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.user?.firstName} {t.user?.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Property"
                value={form.propertyId}
                onChange={hc('propertyId')}
                required
                disabled={!!form.tenantId}
              >
                {properties.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Unit"
                value={form.unitId}
                onChange={hc('unitId')}
                required
                disabled={!!form.tenantId}
              >
                {units.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.unitNumber}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={form.invoiceNumber}
                onChange={hc('invoiceNumber')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Issue Date"
                type="date"
                value={form.issueDate}
                onChange={hc('issueDate')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={form.dueDate}
                onChange={hc('dueDate')}
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={form.amount}
                onChange={hc('amount')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Status"
                value={form.status}
                onChange={hc('status')}
                required
              >
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="SENT">Open</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="PARTIAL">Partial</MenuItem>
                <MenuItem value="OVERDUE">Overdue</MenuItem>
                <MenuItem value="CANCELLED">Void</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={form.description}
                onChange={hc('description')}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#3b3fd8', '&:hover': { bgcolor: '#2d31b3' } }}
          >
            {editing ? 'Update Invoice' : 'Add Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
