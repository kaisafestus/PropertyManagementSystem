'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Receipt as PaymentIcon,
  Build as MaintenanceIcon,
  AttachMoney as MoneyIcon,
  Description as DocIcon,
  Notifications as NoticeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface DashboardData {
  tenant: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  outstandingBalance: number;
  totalPaidThisYear: number;
  openMaintenance: number;
  inProgressMaintenance: number;
  completedMaintenance: number;
  nextDueInvoice: any;
  recentPayments: any[];
  recentNotifications: any[];
  recentDocuments: any[];
  recentMaintenance: any[];
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

export default function TenantDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/tenant-portal/dashboard');
        setData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {getGreeting()}, {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome to your tenant portal
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Outstanding Balance"
            value={`KES ${(data?.outstandingBalance ?? 0).toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#d32f2f"
            subtitle="Due soon"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Open Maintenance"
            value={data?.openMaintenance ?? 0}
            icon={<MaintenanceIcon />}
            color="#f57c00"
            subtitle={`${data?.inProgressMaintenance ?? 0} in progress`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Paid"
            value={`KES ${(data?.totalPaidThisYear ?? 0).toLocaleString()}`}
            icon={<PaymentIcon />}
            color="#388e3c"
            subtitle="This year"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Documents"
            value={data?.recentDocuments?.length ?? 0}
            icon={<DocIcon />}
            color="#1976d2"
            subtitle="Available files"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Next Rent Due
              </Typography>
              {data?.nextDueInvoice ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Invoice #{data.nextDueInvoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      KES {Number(data.nextDueInvoice.totalAmount).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Due: {new Date(data.nextDueInvoice.dueDate).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={data.nextDueInvoice.status}
                      color={data.nextDueInvoice.status === 'OVERDUE' ? 'error' : 'warning'}
                      size="small"
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => router.push('/my-payments')}
                  >
                    Pay Rent
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No pending invoices
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Maintenance
              </Typography>
              {data?.recentMaintenance?.length ? (
                data.recentMaintenance.map((req: any) => (
                  <Box
                    key={req.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {req.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.property?.name} - {req.unit?.unitNumber}
                      </Typography>
                    </Box>
                    <Chip
                      label={req.status}
                      color={
                        req.status === 'COMPLETED'
                          ? 'success'
                          : req.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'warning'
                      }
                      size="small"
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No maintenance requests
                </Typography>
              )}
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => router.push('/tenant-maintenance')}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => router.push('/my-payments')}
              >
                Pay Rent
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => router.push('/tenant-maintenance')}
              >
                Report Maintenance
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => router.push('/my-lease')}
              >
                View Lease
              </Button>
              <Button variant="outlined" fullWidth onClick={() => router.push('/tenant-messages')}>
                Contact Management
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Notices
              </Typography>
              {data?.recentNotifications?.length ? (
                data.recentNotifications.slice(0, 3).map((notice: any) => (
                  <Box
                    key={notice.id}
                    sx={{ mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {notice.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notice.message}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent notices
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Documents
              </Typography>
              {data?.recentDocuments?.length ? (
                data.recentDocuments.slice(0, 4).map((doc: any) => (
                  <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DocIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" noWrap>
                      {doc.name}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No documents available
                </Typography>
              )}
              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => router.push('/tenant-documents')}
              >
                View All
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
