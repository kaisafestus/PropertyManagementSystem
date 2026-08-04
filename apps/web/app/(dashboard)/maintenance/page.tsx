'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Checkbox,
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
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as MinusIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

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
  category?: string;
  cost?: number | string;
  createdAt: string;
  property?: Property;
  unit?: Unit;
  tenant?: Tenant;
  vendor?: Vendor;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in progress',
  WAITING_PARTS: 'waiting parts',
  COMPLETED: 'closed',
  CANCELLED: 'closed',
};

const CATEGORIES = [
  'PLUMBING',
  'ELECTRICAL',
  'HVAC',
  'APPLIANCE',
  'STRUCTURAL',
  'PEST_CONTROL',
  'LANDSCAPING',
  'CLEANING',
  'HANDIWORK',
  'ROOF_REPAIR',
  'OTHER',
];

const fmtDate = (d?: string) => (d ? d.slice(0, 10) : '-');

const guessCategory = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('electric') || t.includes('light') || t.includes('wiring')) return 'electrical';
  if (t.includes('pest') || t.includes('cockroach') || t.includes('rat')) return 'pest_control';
  if (t.includes('roof') || t.includes('leak') || t.includes('stain')) return 'roof_repair';
  if (t.includes('pipe') || t.includes('water') || t.includes('plumb') || t.includes('tap'))
    return 'plumbing';
  if (t.includes('gate') || t.includes('hinge') || t.includes('door') || t.includes('tile'))
    return 'handiwork';
  return 'other';
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
  category: 'OTHER',
  cost: '',
};

// ── FilterSection ──────────────────────────────────────────────────────────────

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

// ── OptionsMenu ────────────────────────────────────────────────────────────────

function OptionsMenu({
  req,
  onEdit,
  onDelete,
}: {
  req: MaintRequest;
  onEdit: (r: MaintRequest) => void;
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
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
            onEdit(req);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Mark in progress
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Mark closed
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Assign vendor
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(req.id);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MaintRequest | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatuses, setFilterStatuses] = useState(['open', 'in progress', 'closed']);

  const load = async () => {
    try {
      const { data } = await api.get('/maintenance');
      setRequests(data);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    load();
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => {});
    api
      .get('/tenants')
      .then(({ data }) => setTenants(data))
      .catch(() => {});
    api
      .get('/vendors')
      .then(({ data }) => setVendors(data))
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

  const stats = useMemo(
    () => ({
      open: requests.filter((r) => r.status === 'OPEN').length,
      inProgress: requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED')
        .length,
    }),
    [requests],
  );

  const filtered = useMemo(
    () =>
      requests.filter((r) => {
        if (filterProperty && r.propertyId !== filterProperty) return false;
        const label = STATUS_LABEL[r.status] ?? r.status.toLowerCase();
        const bucket =
          label === 'open'
            ? 'open'
            : label === 'in progress' || label === 'assigned'
              ? 'in progress'
              : 'closed';
        if (filterStatuses.length && !filterStatuses.includes(bucket)) return false;
        return true;
      }),
    [requests, filterProperty, filterStatuses],
  );

  const toggleStatus = (s: string) =>
    setFilterStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const hc = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setDialogOpen(true);
  };
  const openEdit = (r: MaintRequest) => {
    setEditing(r);
    setForm({
      propertyId: r.propertyId,
      unitId: r.unitId ?? '',
      tenantId: r.tenantId ?? '',
      vendorId: r.vendorId ?? '',
      title: r.title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      category: r.category ?? 'OTHER',
      cost: r.cost ? String(r.cost) : '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!form.propertyId || !form.title || !form.description) {
      setFormError('Property, title and description are required.');
      return;
    }
    try {
      const body: Record<string, unknown> = {
        propertyId: form.propertyId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        category: form.category,
      };
      if (form.unitId) body.unitId = form.unitId;
      if (form.tenantId) body.tenantId = form.tenantId;
      if (form.vendorId) body.vendorId = form.vendorId;
      if (form.cost) body.cost = parseFloat(form.cost);
      if (editing) await api.patch(`/maintenance/${editing.id}`, body);
      else await api.post('/maintenance', body);
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/maintenance/${id}`);
      load();
    } catch {}
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
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
          Add Maintenance
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* Filter panel */}
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
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
              Filters
            </Typography>
            <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
          </Box>

          <FilterSection title="Property / Unit">
            <FormControl size="small" fullWidth>
              <Select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value as string)}
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

          <FilterSection title="Status">
            {['open', 'in progress', 'closed'].map((s) => (
              <FormControlLabel
                key={s}
                control={
                  <Checkbox
                    size="small"
                    checked={filterStatuses.includes(s)}
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
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}
                >
                  <Divider sx={{ flex: 1, mr: 1.5 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Open Requests
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {stats.open}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}
                >
                  <Divider sx={{ flex: 1, mr: 1.5 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    In Progress Requests
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {stats.inProgress}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Table */}
          <Card
            sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
          >
            <Box
              sx={{
                p: 2,
                pb: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                Maintenance
              </Typography>
              <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        color: 'text.secondary',
                        pl: 2.5,
                      }}
                    >
                      Short Summary
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Property Name
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Unit ID/Name
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Category
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Expense
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Options
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ pl: 2.5 }}>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.85rem',
                            color: '#3b3fd8',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontWeight: 500,
                          }}
                        >
                          {r.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {r.property?.name ?? '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {r.unit?.unitNumber ?? ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {STATUS_LABEL[r.status] ?? r.status.toLowerCase()}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                        {r.category
                          ? r.category.toLowerCase().replace(/_/g, ' ')
                          : guessCategory(r.title)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#d1d5db',
                            color: 'text.primary',
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            py: 0.3,
                            px: 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Create Expense
                        </Button>
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '0.82rem', color: 'text.secondary', whiteSpace: 'nowrap' }}
                      >
                        {fmtDate(r.createdAt)}
                      </TableCell>
                      <TableCell>
                        <OptionsMenu req={r} onEdit={openEdit} onDelete={handleDelete} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No maintenance requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? 'Edit Request' : 'Add Maintenance Request'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              select
              fullWidth
              label="Property"
              value={form.propertyId}
              onChange={hc('propertyId')}
              required
            >
              {properties.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Unit" value={form.unitId} onChange={hc('unitId')}>
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
              onChange={hc('tenantId')}
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
              onChange={hc('vendorId')}
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
              label="Title / Short Summary"
              value={form.title}
              onChange={hc('title')}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={hc('description')}
              multiline
              rows={3}
              required
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={form.category}
              onChange={hc('category')}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c.toLowerCase().replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Priority"
              value={form.priority}
              onChange={hc('priority')}
            >
              {['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Status" value={form.status} onChange={hc('status')}>
              {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CANCELLED'].map(
                (s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </MenuItem>
                ),
              )}
            </TextField>
            <TextField
              fullWidth
              label="Cost (KES)"
              type="number"
              value={form.cost}
              onChange={hc('cost')}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#3b3fd8', '&:hover': { bgcolor: '#2d31b3' } }}
          >
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
