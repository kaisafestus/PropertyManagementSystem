'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Apartment as PropertyIcon,
  ArrowForward as ArrowForwardIcon,
  AttachMoney as MoneyIcon,
  Build as MaintenanceIcon,
  People as TenantIcon,
  TrendingUp as TrendIcon,
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
  <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Avatar
          sx={{
            bgcolor: alpha(color, 0.12),
            color: color,
            width: 46,
            height: 46,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const router = useRouter();
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

  const occupancyRate = useMemo(() => {
    const units = stats?.properties?.units ?? 0;
    const occupied = stats?.properties?.occupied ?? 0;
    if (!units) return 0;
    return Math.round((occupied / units) * 100);
  }, [stats]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ maxWidth: 620 }}>
              <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: '0.3em' }}>
                LANDLORD DASHBOARD
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Stay on top of your portfolio, tenants, and property performance.
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                Monitor occupancy, revenue, maintenance, and landlord priorities from one place.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/properties')}
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f8fafc' } }}
              >
                New property
              </Button>
              <Button
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/maintenance')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.12)' },
                }}
              >
                Review maintenance
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

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
            color="#2e7d32"
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

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Occupancy overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.properties?.occupied ?? 0} of {stats?.properties?.units ?? 0} units
                    currently occupied
                  </Typography>
                </Box>
                <Chip label={`${occupancyRate}% occupied`} color="success" variant="outlined" />
              </Box>
              <LinearProgress
                variant="determinate"
                value={occupancyRate}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mb: 2,
                  bgcolor: alpha('#1976d2', 0.12),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #1976d2 0%, #6366f1 100%)',
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Occupied units
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {stats?.properties?.occupied ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Vacant units
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {(stats?.properties?.units ?? 0) - (stats?.properties?.occupied ?? 0)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Collection rate
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {stats?.financial?.collectionRate ?? '0'}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Quick actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'View properties', path: '/properties' },
                  { label: 'Manage tenants', path: '/tenants' },
                  { label: 'Open invoices', path: '/invoices' },
                  { label: 'Handle maintenance', path: '/maintenance' },
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant="outlined"
                    fullWidth
                    onClick={() => router.push(item.path)}
                    sx={{ justifyContent: 'space-between', px: 2, py: 1.2 }}
                  >
                    <span>{item.label}</span>
                    <ArrowForwardIcon fontSize="small" />
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha('#1976d2', 0.12), color: '#1976d2' }}>
                  <TrendIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Recent activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Updates across your portfolio
                  </Typography>
                </Box>
              </Box>
              <List disablePadding>
                {[
                  '2 lease renewals are due this week',
                  'Maintenance requests are up 8% from last month',
                  'Rent collection is ahead of target',
                ].map((item) => (
                  <ListItem key={item} sx={{ px: 0, py: 0.75 }}>
                    <ListItemText primary={item} secondary="Updated a few minutes ago" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Financial snapshot
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Outstanding balance</Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    KES {(stats?.financial?.outstandingAmount ?? 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Open maintenance</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{stats?.maintenance?.open ?? 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Occupancy target</Typography>
                  <Typography sx={{ fontWeight: 700 }}>95%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Landlord priorities
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep an eye on the most important property and tenant signals this month.
              </Typography>
            </Box>
            <Chip label="For landlords" color="primary" variant="outlined" />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#1976d2', 0.06) }}>
                <Typography variant="body2" color="text.secondary">
                  Occupancy rate
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {occupancyRate}%
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#2e7d32', 0.06) }}>
                <Typography variant="body2" color="text.secondary">
                  Rent collected
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {stats?.financial?.collectionRate ?? '0'}%
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#f57c00', 0.06) }}>
                <Typography variant="body2" color="text.secondary">
                  Outstanding balance
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  KES {(stats?.financial?.outstandingAmount ?? 0).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#d32f2f', 0.06) }}>
                <Typography variant="body2" color="text.secondary">
                  Open maintenance
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {stats?.maintenance?.open ?? 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
