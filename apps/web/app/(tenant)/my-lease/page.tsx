'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import { CalendarToday, Home, Payment, Description } from '@mui/icons-material';
import api from '@/lib/api';

interface LeaseData {
  tenant: any;
  lease: {
    id: string;
    invoiceNumber: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    rentDueDate: string;
    status: string;
    renewalStatus: string;
  } | null;
  property: any;
  unit: any;
}

export default function MyLeasePage() {
  const [data, setData] = useState<LeaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const { data } = await api.get('/tenant-portal/lease');
        setData(data);
      } catch (err) {
        console.error('Failed to fetch lease data');
      } finally {
        setLoading(false);
      }
    };
    fetchLease();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  if (!data?.lease) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">No Active Lease</Typography>
          <Typography variant="body2" color="text.secondary">
            You don&apos;t have an active lease yet. Please contact management.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { lease, property, unit } = data;

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ color: 'primary.main', mr: 2 }}>{icon}</Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        My Lease
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Lease Details
                </Typography>
                <Chip label={lease.status} color="success" />
              </Box>

              <InfoRow icon={<Description />} label="Lease Number" value={lease.invoiceNumber} />
              <InfoRow icon={<Home />} label="Property" value={property?.name || 'N/A'} />
              <InfoRow icon={<Home />} label="Unit" value={unit?.unitNumber || 'N/A'} />
              <InfoRow
                icon={<CalendarToday />}
                label="Move-in Date"
                value={new Date(lease.startDate).toLocaleDateString()}
              />
              <InfoRow
                icon={<CalendarToday />}
                label="Lease Start"
                value={new Date(lease.startDate).toLocaleDateString()}
              />
              <InfoRow
                icon={<CalendarToday />}
                label="Lease End"
                value={new Date(lease.endDate).toLocaleDateString()}
              />
              <InfoRow
                icon={<Payment />}
                label="Monthly Rent"
                value={`KES ${lease.monthlyRent.toLocaleString()}`}
              />
              <InfoRow
                icon={<Payment />}
                label="Security Deposit"
                value={`KES ${lease.securityDeposit.toLocaleString()}`}
              />
              <InfoRow
                icon={<CalendarToday />}
                label="Rent Due Date"
                value={new Date(lease.rentDueDate).toLocaleDateString()}
              />
              <InfoRow icon={<Description />} label="Renewal Status" value={lease.renewalStatus} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Actions
              </Typography>
              <Button variant="contained" fullWidth sx={{ mb: 1 }}>
                Download Lease
              </Button>
              <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                Request Renewal
              </Button>
              <Button variant="outlined" fullWidth>
                Contact Manager
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Unit Details
              </Typography>
              {unit && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Bedrooms: {unit.bedrooms}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bathrooms: {unit.bathrooms}
                  </Typography>
                  {unit.sizeSqFt && (
                    <Typography variant="body2" color="text.secondary">
                      Size: {unit.sizeSqFt} sq ft
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
