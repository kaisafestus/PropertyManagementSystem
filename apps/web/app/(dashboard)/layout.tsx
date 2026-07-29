'use client';

import { useState } from 'react';
import { Box, Toolbar, Typography } from '@mui/material';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <TopBar />
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - 260px)` },
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
