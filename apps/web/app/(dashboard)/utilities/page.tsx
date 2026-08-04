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
  Snackbar,
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
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Remove as MinusIcon,
  Article as InvoiceIcon,
  Send as SendIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Property {
  id: string;
  name: string;
}
interface Unit {
  id: string;
  unitNumber: string;
  propertyId: string;
  property?: Property;
}

interface UtilityReading {
  id: string;
  date: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  item: 'water' | 'electricity';
  previousReading: number;
  currentReading: number;
  invoiceId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shortId = (id: string) => id.slice(-8);
const fmtDate = (d: string) => d.slice(0, 10);
const fmt3 = (n: number) => n.toFixed(3);

// Seed some demo readings derived from real units
function seedReadings(units: Unit[]): UtilityReading[] {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('utilityReadings') : null;
  if (saved) return JSON.parse(saved);
  const items: UtilityReading[] = units.slice(0, 20).map((u, i) => ({
    id: `r-${u.id}`,
    date: '2026-07-31',
    propertyId: u.propertyId,
    propertyName: u.property?.name ?? 'Unknown',
    unitId: u.id,
    unitNumber: u.unitNumber,
    item: i % 3 === 0 ? 'electricity' : 'water',
    previousReading: 85 + i * 3,
    currentReading: 98 + i * 3,
    invoiceId: `inv-${shortId(u.id)}`,
  }));
  if (typeof window !== 'undefined') localStorage.setItem('utilityReadings', JSON.stringify(items));
  return items;
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

interface FilterState {
  items: string[];
  dateFrom: string;
  dateTo: string;
  propertyId: string;
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
  const toggleItem = (item: string) => {
    const next = filters.items.includes(item)
      ? filters.items.filter((x) => x !== item)
      : [...filters.items, item];
    onChange({ ...filters, items: next });
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

      <FilterSection title="Utility Item">
        {['water', 'electricity'].map((item) => (
          <FormControlLabel
            key={item}
            control={
              <Checkbox
                size="small"
                checked={filters.items.includes(item)}
                onChange={() => toggleItem(item)}
                sx={{ '&.Mui-checked': { color: '#3b3fd8' } }}
              />
            }
            label={<Typography variant="body2">{item}</Typography>}
            sx={{ display: 'flex', ml: 0 }}
          />
        ))}
      </FilterSection>

      <FilterSection title="Date">
        <TextField
          size="small"
          fullWidth
          placeholder="Start date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          sx={{ mb: 1 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          fullWidth
          placeholder="End date"
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </FilterSection>

      <FilterSection title="Property / Unit">
        <FormControl size="small" fullWidth>
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
      </FilterSection>
    </Card>
  );
}

// ─── Options Menu ─────────────────────────────────────────────────────────────

function OptionsMenu({
  reading,
  onDelete,
}: {
  reading: UtilityReading;
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
        <MenuItem dense onClick={() => setAnchor(null)}>
          Edit reading
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          Create invoice
        </MenuItem>
        <MenuItem dense onClick={() => setAnchor(null)}>
          View invoice
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(reading.id);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Record Utility Dialog ────────────────────────────────────────────────────

const emptyReadingForm = {
  propertyId: '',
  unitId: '',
  item: 'water' as 'water' | 'electricity',
  date: new Date().toISOString().slice(0, 10),
  previousReading: '',
  currentReading: '',
};

function RecordDialog({
  open,
  onClose,
  properties,
  units,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  properties: Property[];
  units: Unit[];
  onSave: (r: UtilityReading) => void;
}) {
  const [form, setForm] = useState(emptyReadingForm);
  const [error, setError] = useState('');
  const filteredUnits = units.filter((u) => !form.propertyId || u.propertyId === form.propertyId);

  const handleSave = () => {
    setError('');
    if (!form.propertyId || !form.unitId || !form.previousReading || !form.currentReading) {
      setError('All fields are required.');
      return;
    }
    const prop = properties.find((p) => p.id === form.propertyId);
    const unit = units.find((u) => u.id === form.unitId);
    onSave({
      id: `r-${Date.now()}`,
      date: form.date,
      propertyId: form.propertyId,
      propertyName: prop?.name ?? '',
      unitId: form.unitId,
      unitNumber: unit?.unitNumber ?? '',
      item: form.item,
      previousReading: parseFloat(form.previousReading),
      currentReading: parseFloat(form.currentReading),
    });
    setForm(emptyReadingForm);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Record Utility Reading</DialogTitle>
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
            onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value, unitId: '' }))}
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
            onChange={(e) => setForm((f) => ({ ...f, unitId: e.target.value }))}
            disabled={!form.propertyId}
          >
            <MenuItem value="">Select unit</MenuItem>
            {filteredUnits.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.unitNumber}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Utility Item"
            value={form.item}
            onChange={(e) =>
              setForm((f) => ({ ...f, item: e.target.value as 'water' | 'electricity' }))
            }
          >
            <MenuItem value="water">Water</MenuItem>
            <MenuItem value="electricity">Electricity</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            label="Previous Reading"
            type="number"
            value={form.previousReading}
            onChange={(e) => setForm((f) => ({ ...f, previousReading: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Current Reading"
            type="number"
            value={form.currentReading}
            onChange={(e) => setForm((f) => ({ ...f, currentReading: e.target.value }))}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ bgcolor: '#3b3fd8', '&:hover': { bgcolor: '#2d31b3' } }}
        >
          Save Reading
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UtilitiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [readings, setReadings] = useState<UtilityReading[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [recordOpen, setRecordOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    items: ['water', 'electricity'],
    dateFrom: '',
    dateTo: '',
    propertyId: '',
  });

  useEffect(() => {
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => {});
    api
      .get('/units')
      .then(({ data }) => {
        setUnits(data);
        setReadings(seedReadings(data));
      })
      .catch(() => {});
  }, []);

  const saveReadings = (next: UtilityReading[]) => {
    setReadings(next);
    if (typeof window !== 'undefined')
      localStorage.setItem('utilityReadings', JSON.stringify(next));
  };

  const handleSaveReading = (r: UtilityReading) => {
    saveReadings([r, ...readings]);
    setToast('Reading recorded successfully.');
  };

  const handleDelete = (id: string) => saveReadings(readings.filter((r) => r.id !== id));

  const handleReset = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('utilityReadings');
    setReadings(seedReadings(units));
    setToast('Utilities reset.');
  };

  // Filtered
  const filtered = useMemo(() => {
    return readings.filter((r) => {
      if (filters.items.length && !filters.items.includes(r.item)) return false;
      if (filters.propertyId && r.propertyId !== filters.propertyId) return false;
      if (filters.dateFrom && r.date < filters.dateFrom) return false;
      if (filters.dateTo && r.date > filters.dateTo) return false;
      return true;
    });
  }, [readings, filters]);

  // Selection
  const allSelected = filtered.length > 0 && selected.length === filtered.length;
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((r) => r.id));
  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setRecordOpen(true)}
          sx={{
            bgcolor: '#3b3fd8',
            '&:hover': { bgcolor: '#2d31b3' },
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Record Utility
        </Button>
        <Button
          variant="outlined"
          sx={{
            borderColor: '#d1d5db',
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
          }}
        >
          Bulk Upload Utilities
        </Button>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            borderColor: '#d1d5db',
            color: 'text.primary',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
          }}
        >
          Reset Utilities
        </Button>
      </Box>

      {/* Body */}
      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
        {/* Filter panel */}
        <FilterPanel filters={filters} onChange={setFilters} properties={properties} />

        {/* Utilities table */}
        <Card
          sx={{
            flex: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <Box sx={{ p: 2, pb: 0.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
                Utilities
              </Typography>
              <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
            </Box>

            {/* Action bar */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<InvoiceIcon fontSize="small" />}
                disabled={selected.length === 0}
                sx={{
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: 'text.primary',
                  fontSize: '0.82rem',
                }}
              >
                Create Invoices
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
                Send Reminders
              </Button>
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
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Property
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Unit
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Item
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Previous Reading
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Current Reading
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Invoice ID/Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                    Options
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => {
                  const isSelected = selected.includes(r.id);
                  return (
                    <TableRow
                      key={r.id}
                      hover
                      selected={isSelected}
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell padding="checkbox" sx={{ pl: 2 }}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleOne(r.id)}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: '0.82rem', color: 'text.secondary', whiteSpace: 'nowrap' }}
                      >
                        {fmtDate(r.date)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {r.propertyName}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {r.unitNumber}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {r.item}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {fmt3(r.previousReading)}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {fmt3(r.currentReading)}
                      </TableCell>
                      <TableCell>
                        {r.invoiceId ? (
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
                            {r.invoiceId.slice(-8)}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <OptionsMenu reading={r} onDelete={handleDelete} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      No utility readings found. Click "Record Utility" to add one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Record dialog */}
      <RecordDialog
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        properties={properties}
        units={units}
        onSave={handleSaveReading}
      />

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
