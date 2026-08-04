'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface Property {
  id: string;
  name: string;
}

export default function AddGroupingPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [name, setName] = useState('');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => {});
  }, []);

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Grouping name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/property-groupings', {
        name: name.trim(),
        description: description.trim() || undefined,
        propertyIds: selectedPropertyIds,
      });
      router.push('/property-grouping');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : typeof msg === 'string' ? msg : 'Failed to add grouping.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const labelSx = {
    width: 160,
    flexShrink: 0,
    textAlign: 'right' as const,
    pt: 1,
    pr: 3,
    fontSize: '0.95rem',
    color: 'text.primary',
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2, py: 1 }}>
      {/* Back */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push('/property-grouping')}
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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Property Grouping Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
        Use this form to add property groupings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, maxWidth: 760 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Name */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, maxWidth: 760 }}>
        <Typography component="span" sx={labelSx}>
          Name
        </Typography>
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="grouping name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Box>
      </Box>

      {/* Properties */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, maxWidth: 760 }}>
        <Typography component="span" sx={labelSx}>
          Properties
        </Typography>
        <Box sx={{ flex: 1 }}>
          <TextField
            select
            fullWidth
            size="small"
            value=""
            onChange={(e) => {
              if (e.target.value) toggleProperty(e.target.value);
            }}
            slotProps={{
              select: {
                displayEmpty: true,
                renderValue: () => (
                  <Typography variant="body2" color="text.secondary">
                    Please select property(s)
                  </Typography>
                ),
              },
            }}
          >
            {properties.map((p) => (
              <MenuItem
                key={p.id}
                value={p.id}
                sx={{
                  fontWeight: selectedPropertyIds.includes(p.id) ? 700 : 400,
                  color: selectedPropertyIds.includes(p.id) ? '#3b3fd8' : 'inherit',
                }}
              >
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          {selectedPropertyIds.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
              {selectedPropertyIds.map((id) => {
                const prop = properties.find((p) => p.id === id);
                return prop ? (
                  <Chip
                    key={id}
                    label={prop.name}
                    size="small"
                    onDelete={() => toggleProperty(id)}
                    sx={{ bgcolor: '#eef0ff', color: '#3b3fd8', fontWeight: 500 }}
                  />
                ) : null;
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Show More */}
      <Collapse in={showMore}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, maxWidth: 760 }}>
          <Typography component="span" sx={labelSx}>
            Description
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </Box>
      </Collapse>

      {/* Show More toggle */}
      <Box sx={{ maxWidth: 760, pl: '160px', mb: 3 }}>
        <Button
          size="small"
          endIcon={
            <ExpandMoreIcon
              sx={{ transform: showMore ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
            />
          }
          onClick={() => setShowMore((v) => !v)}
          sx={{
            textTransform: 'none',
            color: 'text.primary',
            textDecoration: 'underline',
            fontWeight: 400,
            p: 0,
            minWidth: 0,
          }}
        >
          {showMore ? 'Show Less' : 'Show More'}
        </Button>
      </Box>

      {/* Submit + divider */}
      <Box sx={{ maxWidth: 760 }}>
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
            mb: 1.5,
          }}
        >
          Add Grouping
        </Button>
        <Divider />
      </Box>
    </Box>
  );
}
