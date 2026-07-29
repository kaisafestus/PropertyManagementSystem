'use client';

import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import {
  Apartment as PropertyIcon,
  People as TenantIcon,
  Build as MaintenanceIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import api from '@/lib/api';

interface DashboardStats {
  properties: { total: number; units: number; occupied: number; vacancyRate: string };
  tenants: { total: number };
  maintenance: { open: number };
  financial: { totalRevenue: number; outstandingAmount: number; collectionRate: string };
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: `${color}15`,
            color: color,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        setStats(data);
      } catch {
        setStats(null);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Properties"
            value={stats?.properties?.total ?? 0}
            icon={<PropertyIcon />}
            color="#1976d2"
            subtitle={`${stats?.properties?.units ?? 0} total units`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Tenants"
            value={stats?.tenants?.total ?? 0}
            icon={<TenantIcon />}
            color="#388e3c"
            subtitle={`${stats?.properties?.vacancyRate ?? '0'}% vacancy`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Revenue"
            value={`KES ${(stats?.financial?.totalRevenue ?? 0).toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#f57c00"
            subtitle={`${stats?.financial?.collectionRate ?? '0'}% collected`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Open Maintenance"
            value={stats?.maintenance?.open ?? 0}
            icon={<MaintenanceIcon />}
            color="#d32f2f"
            subtitle={`KES ${(stats?.financial?.outstandingAmount ?? 0).toLocaleString()} outstanding`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Occupancy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.properties?.occupied ?? 0} of {stats?.properties?.units ?? 0} units occupied
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage properties, tenants, invoices, and maintenance from the sidebar.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
