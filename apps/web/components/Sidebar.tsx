'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AttachMoney as FinancialsIcon,
  Receipt as InvoicesIcon,
  Payment as PaymentsIcon,
  MoneyOff as ExpensesIcon,
  Person as TenantIcon,
  Home as PropertyIcon,
  Apartment as PropertiesIcon,
  ViewModule as UnitsIcon,
  Bolt as UtilitiesIcon,
  Build as MaintenanceIcon,
  AccountTree as PropertyGroupingIcon,
  BarChart as ReportsIcon,
  Article as StatementsIcon,
  Insights as InsightsIcon,
  Mail as CommunicationIcon,
  Settings as SettingsIcon,
  Tune as GeneralIcon,
  Backup as BackupIcon,
  NotificationsActive as AlertsIcon,
  AccountCircle as AccountInfoIcon,
  Description as DocumentsIcon,
  Chat as CustomMessageIcon,
  Group as TeamIcon,
  CreditCard as BillingIcon,
  PhoneAndroid as MpesaIcon,
  History as AuditTrailIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/auth-store';

const DRAWER_WIDTH = 250;

// Dark navy color palette matching screenshots
const NAVY = '#0d1b4b';
const NAVY_HOVER = '#162054';
const NAVY_ACTIVE = '#1a2560';
const TEXT_PRIMARY = '#e8eaf6';
const TEXT_SECONDARY = '#8fa3d4';
const ACCENT_CYAN = '#00e5ff';
const ACTIVE_LEFT_BORDER = '#00bcd4';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
}

const navSections: NavSection[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon fontSize="small" />,
    path: '/dashboard',
  },
  {
    key: 'financials',
    label: 'Financials',
    icon: <FinancialsIcon fontSize="small" />,
    children: [
      { label: 'Invoices', path: '/invoices', icon: <InvoicesIcon fontSize="small" /> },
      { label: 'Payments', path: '/payments', icon: <PaymentsIcon fontSize="small" /> },
      { label: 'Expenses', path: '/expenses', icon: <ExpensesIcon fontSize="small" /> },
    ],
  },
  {
    key: 'tenants',
    label: 'Tenants',
    icon: <TenantIcon fontSize="small" />,
    path: '/tenants',
  },
  {
    key: 'property',
    label: 'Property/Unit',
    icon: <PropertyIcon fontSize="small" />,
    children: [
      { label: 'Properties', path: '/properties', icon: <PropertiesIcon fontSize="small" /> },
      { label: 'Units', path: '/units', icon: <UnitsIcon fontSize="small" /> },
      { label: 'Utilities', path: '/utilities', icon: <UtilitiesIcon fontSize="small" /> },
      { label: 'Maintenance', path: '/maintenance', icon: <MaintenanceIcon fontSize="small" /> },
      {
        label: 'Property Grouping',
        path: '/property-grouping',
        icon: <PropertyGroupingIcon fontSize="small" />,
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <ReportsIcon fontSize="small" />,
    children: [
      { label: 'Statements', path: '/statements', icon: <StatementsIcon fontSize="small" /> },
      { label: 'Insights (beta)', path: '/insights', icon: <InsightsIcon fontSize="small" /> },
    ],
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: <CommunicationIcon fontSize="small" />,
    path: '/communication',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <SettingsIcon fontSize="small" />,
    children: [
      { label: 'General', path: '/settings/general', icon: <GeneralIcon fontSize="small" /> },
      { label: 'Backup', path: '/settings/backup', icon: <BackupIcon fontSize="small" /> },
      { label: 'Alerts', path: '/settings/alerts', icon: <AlertsIcon fontSize="small" /> },
      {
        label: 'Account Info',
        path: '/settings/account',
        icon: <AccountInfoIcon fontSize="small" />,
      },
      { label: 'Documents (beta)', path: '/documents', icon: <DocumentsIcon fontSize="small" /> },
      {
        label: 'Custom Message Template',
        path: '/settings/message-templates',
        icon: <CustomMessageIcon fontSize="small" />,
      },
      { label: 'Team', path: '/invitations', icon: <TeamIcon fontSize="small" /> },
      { label: 'Billing', path: '/settings/billing', icon: <BillingIcon fontSize="small" /> },
      {
        label: 'MPESA Transactions',
        path: '/settings/mpesa',
        icon: <MpesaIcon fontSize="small" />,
      },
      { label: 'Audit Trail', path: '/settings/audit', icon: <AuditTrailIcon fontSize="small" /> },
    ],
  },
];

// Initial open state — financials and property/unit open by default like screenshots
const defaultOpenState: Record<string, boolean> = {
  financials: true,
  property: true,
  settings: false,
  reports: false,
};

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(defaultOpenState);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isPathActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const isSectionActive = (section: NavSection): boolean => {
    if (section.path) return isPathActive(section.path);
    return section.children?.some((c) => isPathActive(c.path)) ?? false;
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: NAVY,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '2px' },
      }}
    >
      {/* Logo / Brand area */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: TEXT_PRIMARY,
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.02em',
          }}
        >
          PropertyMS
        </Typography>
        {user && (
          <Typography
            variant="caption"
            sx={{ color: TEXT_SECONDARY, display: 'block', mt: 0.25, fontSize: '0.72rem' }}
          >
            {user.firstName} {user.lastName} &middot; {user.role?.toLowerCase()}
          </Typography>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ p: 0, pt: 1, flexGrow: 1 }}>
        {navSections.map((section) => {
          const hasChildren = !!section.children?.length;
          const isOpen = openSections[section.key];
          const active = isSectionActive(section);

          if (!hasChildren && section.path) {
            // Direct nav item (no children)
            return (
              <ListItem key={section.key} disablePadding>
                <ListItemButton
                  onClick={() => {
                    router.push(section.path!);
                    onMobileClose?.();
                  }}
                  sx={{
                    px: 2.5,
                    py: 0.9,
                    color: active ? TEXT_PRIMARY : TEXT_SECONDARY,
                    borderLeft: active
                      ? `3px solid ${ACTIVE_LEFT_BORDER}`
                      : '3px solid transparent',
                    bgcolor: active ? NAVY_ACTIVE : 'transparent',
                    '&:hover': {
                      bgcolor: NAVY_HOVER,
                      color: TEXT_PRIMARY,
                    },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 34,
                      color: active ? ACCENT_CYAN : TEXT_SECONDARY,
                    }}
                  >
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={section.label}
                    slotProps={{
                      primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          }

          // Section with children (collapsible)
          return (
            <Box key={section.key}>
              <ListItemButton
                onClick={() => toggleSection(section.key)}
                sx={{
                  px: 2.5,
                  py: 0.9,
                  color: active ? TEXT_PRIMARY : TEXT_SECONDARY,
                  '&:hover': {
                    bgcolor: NAVY_HOVER,
                    color: TEXT_PRIMARY,
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: active ? ACCENT_CYAN : TEXT_SECONDARY }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText
                  primary={section.label}
                  slotProps={{
                    primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 600 : 400 } },
                  }}
                />
                {isOpen ? (
                  <ExpandLess sx={{ fontSize: '1rem', color: TEXT_SECONDARY }} />
                ) : (
                  <ExpandMore sx={{ fontSize: '1rem', color: TEXT_SECONDARY }} />
                )}
              </ListItemButton>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {section.children!.map((child) => {
                    const childActive = isPathActive(child.path);
                    return (
                      <ListItem key={child.path} disablePadding>
                        <ListItemButton
                          onClick={() => {
                            router.push(child.path);
                            onMobileClose?.();
                          }}
                          sx={{
                            pl: 4.5,
                            pr: 2.5,
                            py: 0.75,
                            color: childActive ? TEXT_PRIMARY : TEXT_SECONDARY,
                            borderLeft: childActive
                              ? `3px solid ${ACTIVE_LEFT_BORDER}`
                              : '3px solid transparent',
                            bgcolor: childActive ? NAVY_ACTIVE : 'transparent',
                            '&:hover': {
                              bgcolor: NAVY_HOVER,
                              color: TEXT_PRIMARY,
                            },
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <ListItemText
                            primary={child.label}
                            slotProps={{
                              primary: {
                                sx: { fontSize: '0.85rem', fontWeight: childActive ? 600 : 400 },
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            bgcolor: NAVY,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => onMobileClose?.()}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: NAVY,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
