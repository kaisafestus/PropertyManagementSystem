import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const permissions = [
  // Properties
  { resource: 'property', action: 'create' },
  { resource: 'property', action: 'read' },
  { resource: 'property', action: 'update' },
  { resource: 'property', action: 'delete' },

  // Units
  { resource: 'unit', action: 'create' },
  { resource: 'unit', action: 'read' },
  { resource: 'unit', action: 'update' },
  { resource: 'unit', action: 'delete' },

  // Tenants
  { resource: 'tenant', action: 'create' },
  { resource: 'tenant', action: 'read' },
  { resource: 'tenant', action: 'update' },
  { resource: 'tenant', action: 'delete' },

  // Vendors
  { resource: 'vendor', action: 'create' },
  { resource: 'vendor', action: 'read' },
  { resource: 'vendor', action: 'update' },
  { resource: 'vendor', action: 'delete' },

  // Invoices
  { resource: 'invoice', action: 'create' },
  { resource: 'invoice', action: 'read' },
  { resource: 'invoice', action: 'update' },
  { resource: 'invoice', action: 'delete' },

  // Payments
  { resource: 'payment', action: 'create' },
  { resource: 'payment', action: 'read' },
  { resource: 'payment', action: 'update' },
  { resource: 'payment', action: 'delete' },

  // Maintenance
  { resource: 'maintenance', action: 'create' },
  { resource: 'maintenance', action: 'read' },
  { resource: 'maintenance', action: 'update' },
  { resource: 'maintenance', action: 'delete' },

  // Documents
  { resource: 'document', action: 'create' },
  { resource: 'document', action: 'read' },
  { resource: 'document', action: 'update' },
  { resource: 'document', action: 'delete' },

  // Notifications
  { resource: 'notification', action: 'create' },
  { resource: 'notification', action: 'read' },
  { resource: 'notification', action: 'update' },
  { resource: 'notification', action: 'delete' },

  // Users
  { resource: 'user', action: 'create' },
  { resource: 'user', action: 'read' },
  { resource: 'user', action: 'update' },
  { resource: 'user', action: 'delete' },

  // Invitations
  { resource: 'invitation', action: 'create' },
  { resource: 'invitation', action: 'read' },
  { resource: 'invitation', action: 'update' },
  { resource: 'invitation', action: 'delete' },

  // Reports
  { resource: 'report', action: 'read' },

  // Admin
  { resource: 'admin', action: 'read' },
];

const roles = [
  {
    name: 'LANDLORD',
    description:
      'Full access to the organization - manages all properties, tenants, vendors, and settings',
    permissions: permissions
      .filter((p) => p.resource !== 'admin')
      .map((p) => `${p.resource}:${p.action}`),
  },
  {
    name: 'TENANT',
    description: 'Tenant access - view own data, submit maintenance, make payments',
    permissions: [
      'property:read',
      'unit:read',
      'maintenance:read',
      'maintenance:create',
      'invoice:read',
      'payment:read',
      'payment:create',
      'document:read',
      'notification:read',
    ],
  },
  {
    name: 'VENDOR',
    description: 'Vendor access - view assigned maintenance, update status',
    permissions: ['maintenance:read', 'maintenance:update', 'document:read', 'document:create'],
  },
];

async function main() {
  console.log('Seeding permissions...');

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: `${perm.resource}:${perm.action}` },
      update: {},
      create: {
        name: `${perm.resource}:${perm.action}`,
        resource: perm.resource,
        action: perm.action,
        description: `Can ${perm.action} ${perm.resource}`,
      },
    });
  }

  console.log(`Seeded ${permissions.length} permissions`);

  console.log('Seeding roles...');

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });

    for (const permName of role.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  console.log(`Seeded ${roles.length} roles with permissions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
