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
import { Add, Delete, Description as DocIcon } from '@mui/icons-material';
import api from '@/lib/api';

interface Document {
  id: string;
  name: string;
  url: string;
  category: string;
  fileType: string;
  size: number;
  description?: string;
  entityId: string;
  entityType: string;
  uploadedBy: string;
  createdAt: string;
}

const categories = [
  'PROPERTY',
  'TENANT',
  'LEASE',
  'VENDOR',
  'INVOICE',
  'RECEIPT',
  'MAINTENANCE',
  'INSURANCE',
  'OTHER',
];

const categoryColors: Record<
  string,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'
> = {
  PROPERTY: 'primary',
  TENANT: 'secondary',
  LEASE: 'success',
  VENDOR: 'info',
  INVOICE: 'warning',
  RECEIPT: 'success',
  MAINTENANCE: 'secondary',
  INSURANCE: 'info',
  OTHER: 'default',
};

const emptyForm = {
  name: '',
  url: '',
  category: 'OTHER',
  fileType: 'application/pdf',
  size: '0',
  description: '',
  entityId: '',
  entityType: 'Property',
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/documents');
    setDocuments(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await api.post('/documents', {
        ...form,
        size: parseInt(form.size),
      });
      setOpen(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message?.message || 'Failed to upload document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await api.delete(`/documents/${id}`);
    load();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          Upload Document
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Entity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DocIcon fontSize="small" color="action" />
                      {d.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={d.category}
                      color={categoryColors[d.category] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{d.fileType}</TableCell>
                  <TableCell>{formatSize(d.size)}</TableCell>
                  <TableCell>
                    {d.entityType}: {d.entityId.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDelete(d.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No documents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Name"
            value={form.name}
            onChange={handleChange('name')}
            required
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            label="URL"
            value={form.url}
            onChange={handleChange('url')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Category"
            value={form.category}
            onChange={handleChange('category')}
            required
            sx={{ mb: 2 }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="File Type"
            value={form.fileType}
            onChange={handleChange('fileType')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Size (bytes)"
            type="number"
            value={form.size}
            onChange={handleChange('size')}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={handleChange('description')}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Entity ID"
            value={form.entityId}
            onChange={handleChange('entityId')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Entity Type"
            value={form.entityType}
            onChange={handleChange('entityType')}
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
