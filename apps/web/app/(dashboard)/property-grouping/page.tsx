'use client';

import { useEffect, useState } from 'react';
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
  Remove as MinusIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Property {
  id: string;
  name: string;
}

interface PropertyGrouping {
  id: string;
  name: string;
  description?: string;
  properties?: Property[];
  createdAt: string;
}

const PAGE_SIZE = 10;

// ── Options Menu ───────────────────────────────────────────────────────────────

function OptionsMenu({
  groupId,
  onEdit,
  onDelete,
}: {
  groupId: string;
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
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
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
          View properties
        </MenuItem>
        <Divider />
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            setAnchor(null);
            onDelete(groupId);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function PropertyGroupingPage() {
  const [groups, setGroups] = useState<PropertyGrouping[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PropertyGrouping | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      // Try a dedicated groupings endpoint; fall back to empty list if not implemented
      const { data } = await api.get('/property-groupings');
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      setGroups([]);
    }
  };

  useEffect(() => {
    load();
    api
      .get('/properties')
      .then(({ data }) => setAllProperties(data))
      .catch(() => {});
  }, []);

  const totalPages = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const paginated = groups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (g: PropertyGrouping) => {
    setEditing(g);
    setName(g.name);
    setDescription(g.description ?? '');
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }
    try {
      if (editing) {
        await api.patch(`/property-groupings/${editing.id}`, { name, description });
      } else {
        await api.post('/property-groupings', { name, description });
      }
      setDialogOpen(false);
      load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/property-groupings/${id}`);
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
          Add Grouping
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
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Divider sx={{ flex: 1, mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Total Groupings
            </Typography>
            <Divider sx={{ flex: 1, ml: 2 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b3fd8' }}>
            {groups.length}
          </Typography>
        </Box>
      </Card>

      {/* Property Groupings table card */}
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
            Property Groupings
          </Typography>
          <MinusIcon sx={{ color: '#3b3fd8', fontSize: '1rem' }} />
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell
                  sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary', pl: 2.5 }}
                >
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Properties
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Managers
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', color: 'text.secondary' }}>
                  Options
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((g) => (
                <TableRow key={g.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
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
                      {g.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {g.properties?.map((p) => p.name).join(', ') || '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>—</TableCell>
                  <TableCell>
                    <OptionsMenu
                      groupId={g.id}
                      onEdit={() => openEdit(g)}
                      onDelete={handleDelete}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No groupings yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 1.5 }}
        >
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
              px: 1.5,
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? 'Edit Grouping' : 'Add Grouping'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
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
