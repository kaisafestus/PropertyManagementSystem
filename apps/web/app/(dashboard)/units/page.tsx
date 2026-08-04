'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as MinusIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  id: string;
  name: string;
  totalUnits?: number;
  units?: Unit[];
}
interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor?: string;
  bedrooms: number;
  bathrooms: number | string;
  monthlyRent: number | string;
  securityDeposit: number | string;
  vacant: boolean;
  active?: boolean;
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

const fmtAmount = (n: number | string) =>
  Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Filter Panel ─────────────────────────────────────────────────────────────

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

interface FilterState {
  propertyId: string;
  showVacant: boolean;
}

function FilterPanel({
  filters,
  onChange,
  properties,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  properties: Property[];
}) {
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

      <FilterSection title="Property / Unit">
        <FormControl size="small" fullWidth sx={{ mb: 1 }}>
          <Select
            value={filters.propertyId}
            onChange={(e) => onChange({ ...filters, propertyId: e.target.value as string })}
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
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={filters.showVacant}
              onChange={(e) => onChange({ ...filters, showVacant: e.target.checked })}
            />
          }
          label={<Typography variant="body2">Show Vacant Units</Typography>}
          sx={{ ml: 0 }}
        />
      </FilterSection>
    </Card>
  );
}

// ─── Options Menu ─────────────────────────────────────────────────────────────

function OptionsMenu({
  unit,
  onEdit,
  onDelete,
}: {
  unit: Unit;
  onEdit: (u: Unit) => void;
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
        slotProps={{ paper: { sx: { minWidth: 150 } } }}
      >
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
            onEdit(unit);
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
          View tenant
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          Add invoice
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(unit.id);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UnitsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>({ propertyId: '', showVacant: false });

  const load = async () => {
    try {
      const { data } = await api.get('/units');
      setUnits(data);
    } catch {
      setUnits([]);
    }
  };

  useEffect(() => {
    load();
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => {});
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    const totalUnits = units.length;
    const totalVacancies = units.filter((u) => u.vacant).length;
    return { properties: properties.length, totalUnits, totalVacancies };
  }, [units, properties]);

  // Filtered units
  const filtered = useMemo(() => {
    return units.filter((u) => {
      if (filters.propertyId && u.propertyId !== filters.propertyId) return false;
      if (filters.showVacant && !u.vacant) return false;
      return true;
    });
  }, [units, filters]);

  // Form
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };
  const openEdit = (u: Unit) => {
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
    setError('');
    setOpen(true);
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
      if (editing) await api.patch(`/units/${editing.id}`, body);
      else await api.post('/units', body);
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to save unit');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/units/${id}`);
      load();
    } catch {}
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/units/add')}
          sx={{
            bgcolor: '#3b3fd8',
            '&:hover': { bgcolor: '#2d31b3' },
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Add Unit
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{
            borderColor: '#d1d5db',
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
          }}
        >
          Download Rent Schedule
        </Button>
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
                    Total Properties
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {stats.properties}
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
                    Total Units
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {stats.totalUnits}
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
                    Total Vacancies
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {stats.totalVacancies}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Units table */}
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
                Units
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
                      Property Name
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Unit Name/ID
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Occupied
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Rent
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Tax Rate(%)
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Options
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary', pl: 2.5 }}>
                        {u.property?.name ?? '-'}
                      </TableCell>
                      <TableCell>
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
                          {u.unitNumber}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {u.vacant ? 'No' : 'Yes'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {fmtAmount(u.monthlyRent)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>0</TableCell>
                      <TableCell>
                        <OptionsMenu unit={u} onEdit={openEdit} onDelete={handleDelete} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No units found
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
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              select
              fullWidth
              label="Property"
              value={form.propertyId}
              onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
              required
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
              onChange={set('unitNumber')}
              required
            />
            <TextField fullWidth label="Floor" value={form.floor} onChange={set('floor')} />
            <TextField
              fullWidth
              label="Bedrooms"
              type="number"
              value={form.bedrooms}
              onChange={set('bedrooms')}
              required
            />
            <TextField
              fullWidth
              label="Bathrooms"
              type="number"
              value={form.bathrooms}
              onChange={set('bathrooms')}
              required
            />
            <TextField
              fullWidth
              label="Monthly Rent (KES)"
              type="number"
              value={form.monthlyRent}
              onChange={set('monthlyRent')}
              required
            />
            <TextField
              fullWidth
              label="Security Deposit (KES)"
              type="number"
              value={form.securityDeposit}
              onChange={set('securityDeposit')}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
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
