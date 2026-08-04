'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as MinusIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
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
interface Organization {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  userId: string;
  user?: User;
  property?: Property;
  unit?: Unit;
  createdAt: string;
  accountNumber?: string;
  balance?: number;
  leaseExpiresAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtAmount = (n: number) =>
  Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const accountCode = (tenant: Tenant) => {
  if (!tenant.property || !tenant.unit) return '-';
  const propCode = tenant.property.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const unit = tenant.unit.unitNumber.replace(/\D/g, '') || '1';
  return `${propCode}${unit}${parseInt(unit) + 10}`;
};

const daysToExpiry = (leaseExpiresAt?: string) => {
  if (!leaseExpiresAt) return null;
  const diff = Math.ceil((new Date(leaseExpiresAt).getTime() - Date.now()) / 86400000);
  return diff;
};

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organizationId: '',
  propertyId: '',
  unitId: '',
};

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterState {
  propertyId: string;
  balanceMin: string;
  balanceMax: string;
  showDeleted: boolean;
  daysToExpiry: string;
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

      <FilterSection title="Property">
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

      <FilterSection title="Account Balance">
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="min"
            value={filters.balanceMin}
            onChange={(e) => set('balanceMin', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            placeholder="max"
            value={filters.balanceMax}
            onChange={(e) => set('balanceMax', e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>
      </FilterSection>

      <FilterSection title="Deleted tenants">
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={filters.showDeleted}
              onChange={(e) => set('showDeleted', e.target.checked)}
            />
          }
          label={<Typography variant="body2">show</Typography>}
          sx={{ ml: 0 }}
        />
      </FilterSection>

      <FilterSection title="Days to Lease Expiry">
        <FormControl size="small" fullWidth>
          <Select
            value={filters.daysToExpiry}
            onChange={(e) => set('daysToExpiry', e.target.value)}
            displayEmpty
          >
            <MenuItem value="">-</MenuItem>
            <MenuItem value="30">Within 30 days</MenuItem>
            <MenuItem value="60">Within 60 days</MenuItem>
            <MenuItem value="90">Within 90 days</MenuItem>
          </Select>
        </FormControl>
      </FilterSection>
    </Card>
  );
}

// ─── Options Menu ─────────────────────────────────────────────────────────────

function OptionsMenu({ tenantId, onDelete }: { tenantId: string; onDelete: (id: string) => void }) {
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
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        <MenuItem dense onClick={() => setAnchor(null)}>
          View profile
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          View invoices
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Record payment
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Send statement
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(tenantId);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── More Options Menu ────────────────────────────────────────────────────────

function MoreOptionsMenu() {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
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
        <MenuItem dense onClick={() => setAnchor(null)}>
          Import tenants
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Export tenants
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Send bulk reminders
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    propertyId: '',
    balanceMin: '',
    balanceMax: '',
    showDeleted: false,
    daysToExpiry: '',
  });

  const load = async () => {
    try {
      const { data } = await api.get('/tenants');
      setTenants(data);
    } catch {
      setTenants([]);
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
    const totalArrears = tenants.reduce((s, t) => s + (t.balance ?? 0), 0);
    const expiring = tenants.filter((t) => {
      const d = daysToExpiry(t.leaseExpiresAt);
      return d !== null && d >= 0 && d <= 60;
    }).length;
    return { total: tenants.length, totalArrears, expiring };
  }, [tenants]);

  // Filtered list
  const filtered = useMemo(() => {
    const search = tableSearch.toLowerCase();
    return tenants.filter((t) => {
      const name = `${t.user?.firstName ?? ''} ${t.user?.lastName ?? ''}`.toLowerCase();
      const phone = (t.user?.phone ?? '').toLowerCase();
      if (search && !name.includes(search) && !phone.includes(search)) return false;
      if (filters.propertyId && t.property?.id !== filters.propertyId) return false;
      if (filters.balanceMin && (t.balance ?? 0) < Number(filters.balanceMin)) return false;
      if (filters.balanceMax && (t.balance ?? 0) > Number(filters.balanceMax)) return false;
      if (filters.daysToExpiry) {
        const d = daysToExpiry(t.leaseExpiresAt);
        if (d === null || d > Number(filters.daysToExpiry)) return false;
      }
      return true;
    });
  }, [tenants, tableSearch, filters]);

  // Selection
  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((t) => t.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tenants/${id}`);
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
          onClick={() => router.push('/tenants/add')}
          sx={{
            bgcolor: '#3b3fd8',
            '&:hover': { bgcolor: '#2d31b3' },
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Add Tenant
        </Button>
        <Button
          variant="outlined"
          startIcon={<SendIcon />}
          sx={{
            borderColor: '#d1d5db',
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
          }}
        >
          Send Reminders
        </Button>
        <MoreOptionsMenu />
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
            <Box sx={{ display: 'flex', gap: 0 }}>
              {/* Total Tenants */}
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
                    Total Tenants
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {stats.total}
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* Total Arrears */}
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
                    Total Arrears
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {fmtAmount(stats.totalArrears)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (KES)
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              {/* Expiring Leases */}
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
                    Expiring Leases
                  </Typography>
                  <Divider sx={{ flex: 1, ml: 1.5 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                  {stats.expiring}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (in 60 days)
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Tenants table */}
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
                  Tenants
                </Typography>
                <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
              </Box>

              {/* Action bar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
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
                    Download PDF
                  </Button>
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
                    Send Balance Reminders
                  </Button>
                </Box>
                <TextField
                  size="small"
                  placeholder="Type to search..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  sx={{ width: 220 }}
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
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox
                        size="small"
                        checked={allSelected}
                        indeterminate={selected.length > 0 && !allSelected}
                        onChange={toggleAll}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Tenant Name ↕
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Property ↕
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Unit ID/Name ↑
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Phone Number
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Balance ↕
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Account Number
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}
                    >
                      Options
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((t) => {
                    const isSelected = selected.includes(t.id);
                    const fullName = `${t.user?.firstName ?? ''} ${t.user?.lastName ?? ''}`.trim();
                    const balance = t.balance ?? 0;
                    return (
                      <TableRow
                        key={t.id}
                        hover
                        selected={isSelected}
                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 2 }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={() => toggleOne(t.id)}
                          />
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
                            {fullName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                          {t.property?.name ?? '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                          {t.unit?.unitNumber ?? '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                          {t.user?.phone ?? '-'}
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: '0.85rem',
                              color: balance > 0 ? '#3b3fd8' : 'text.primary',
                              fontWeight: 500,
                              textDecoration: balance > 0 ? 'underline' : 'none',
                              cursor: balance > 0 ? 'pointer' : 'default',
                            }}
                          >
                            {fmtAmount(balance)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                          {accountCode(t)}
                        </TableCell>
                        <TableCell>
                          <OptionsMenu tenantId={t.id} onDelete={handleDelete} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No tenants found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
