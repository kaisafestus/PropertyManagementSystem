'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
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
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Remove as MinusIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Unit {
  id: string;
  unitNumber: string;
  vacant: boolean;
  monthlyRent?: string;
}

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
  organization?: { name: string };
  units?: Unit[];
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

const PAGE_SIZE = 10;

// ─── Options Menu ─────────────────────────────────────────────────────────────

function OptionsMenu({
  property,
  onEdit,
  onDelete,
}: {
  property: Property;
  onEdit: (p: Property) => void;
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
            onEdit(property);
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
          View units
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
          }}
        >
          Add unit
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(property.id);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      const { data } = await api.get('/properties');
      setProperties(data);
    } catch {
      setProperties([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    const totalUnits = properties.reduce((s, p) => s + (p.totalUnits ?? 0), 0);
    const totalVacancies = properties.reduce((s, p) => {
      const vacant = (p.units ?? []).filter((u) => u.vacant).length;
      return s + vacant;
    }, 0);
    return { properties: properties.length, totalUnits, totalVacancies };
  }, [properties]);

  // Filtered + paginated
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q),
    );
  }, [properties, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Form handlers
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };
  const openEdit = (p: Property) => {
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
    setError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (editing) await api.patch(`/properties/${editing.id}`, form);
      else await api.post('/properties', form);
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to save property',
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/properties/${id}`);
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
          onClick={openCreate}
          sx={{
            bgcolor: '#3b3fd8',
            '&:hover': { bgcolor: '#2d31b3' },
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Add Property
        </Button>
        <Button
          variant="outlined"
          onClick={() => router.push('/units/add')}
          sx={{
            borderColor: '#d1d5db',
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Add Unit
        </Button>
      </Box>

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
            Summary
          </Typography>
          <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
        </Box>
        <Box sx={{ display: 'flex' }}>
          {/* Total Properties */}
          <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Divider sx={{ flex: 1, mr: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Total Properties
              </Typography>
              <Divider sx={{ flex: 1, ml: 1.5 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
              {stats.properties}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Total Units */}
          <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Divider sx={{ flex: 1, mr: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Total Units
              </Typography>
              <Divider sx={{ flex: 1, ml: 1.5 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
              {stats.totalUnits}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Total Vacancies */}
          <Box sx={{ flex: 1, textAlign: 'center', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Divider sx={{ flex: 1, mr: 1.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
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

      {/* Properties table card */}
      <Card
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
              Properties
            </Typography>
            <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
          </Box>
          {/* Search */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <TextField
              size="small"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              sx={{ width: 240 }}
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
          </Box>
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
                    width: 30,
                    pl: 2,
                  }}
                />
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Property Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Number of units
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  City
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Managers
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  MPESA Paybill
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Water Rate(KES)
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Options
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', pl: 2 }}>
                    +
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
                      {p.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {p.totalUnits}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {p.city}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {p.organization?.name ?? 'Demo System'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>—</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>50.00</TableCell>
                  <TableCell>
                    <OptionsMenu property={p} onEdit={openEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No properties found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
          </Typography>
          <IconButton
            size="small"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ border: '1px solid #d1d5db', borderRadius: 1, p: 0.5 }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              border: '1px solid #3b3fd8',
              borderRadius: 1,
              px: 1.2,
              py: 0.3,
              minWidth: 32,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#3b3fd8', fontWeight: 600 }}>
              {page}
            </Typography>
          </Box>
          <IconButton
            size="small"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            sx={{ border: '1px solid #d1d5db', borderRadius: 1, p: 0.5 }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? 'Edit Property' : 'Add Property'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField fullWidth label="Name" value={form.name} onChange={set('name')} required />
            <TextField fullWidth label="Code" value={form.code} onChange={set('code')} required />
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={set('description')}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Address"
              value={form.addressLine1}
              onChange={set('addressLine1')}
              required
            />
            <TextField fullWidth label="City" value={form.city} onChange={set('city')} required />
            <TextField
              fullWidth
              label="County"
              value={form.county}
              onChange={set('county')}
              required
            />
            <TextField
              fullWidth
              label="Postal Code"
              value={form.postalCode}
              onChange={set('postalCode')}
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
