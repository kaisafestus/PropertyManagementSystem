'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

const DRAWER_WIDTH = 250;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: '64px',
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
}
