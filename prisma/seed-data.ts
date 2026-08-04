import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const HASH_ROUNDS = 12;
const PASSWORD = 'Password123!';

async function hash(pw: string) {
  return bcrypt.hash(pw, HASH_ROUNDS);
}

async function resetOrganizationData(organizationId: string) {
  const userIds = (
    await prisma.user.findMany({ where: { organizationId }, select: { id: true } })
  ).map((user) => user.id);

  if (userIds.length > 0) {
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.document.deleteMany({ where: { uploadedBy: { in: userIds } } });
  }

  await prisma.payment.deleteMany({ where: { property: { organizationId } } });
  await prisma.invoice.deleteMany({ where: { property: { organizationId } } });
  await prisma.maintenanceRequest.deleteMany({ where: { property: { organizationId } } });
  await prisma.tenant.deleteMany({ where: { user: { organizationId } } });
  await prisma.vendor.deleteMany({ where: { user: { organizationId } } });
  await prisma.userSession.deleteMany({ where: { user: { organizationId } } });
  await prisma.passwordResetToken.deleteMany({ where: { user: { organizationId } } });
  await prisma.unit.deleteMany({ where: { property: { organizationId } } });
  await prisma.property.deleteMany({ where: { organizationId } });
  await prisma.user.deleteMany({ where: { organizationId } });
  await prisma.organization.deleteMany({ where: { id: organizationId } });
}

async function main() {
  console.log('--- Property Management System Seed ---\n');

  const existingOrg = await prisma.organization.findFirst({
    where: { email: 'admin@cityview.com' },
    select: { id: true },
  });

  if (existingOrg) {
    await resetOrganizationData(existingOrg.id);
    console.log('Reset existing demo organization data');
  }

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { email: 'admin@cityview.com' },
    update: {
      name: 'CityView Properties',
      phone: '+1-555-0100',
      status: 'ACTIVE',
    },
    create: {
      name: 'CityView Properties',
      email: 'admin@cityview.com',
      phone: '+1-555-0100',
      status: 'ACTIVE',
    },
  });
  console.log(`Organization: ${org.name} (${org.id})`);

  // 2. Users
  const adminHash = await hash(PASSWORD);
  const landlord = await prisma.user.upsert({
    where: { email: 'landlord@pms.com' },
    update: {
      organizationId: org.id,
      firstName: 'James',
      lastName: 'Mitchell',
      phone: '+1-555-0101',
      passwordHash: adminHash,
      emailVerified: true,
      status: 'ACTIVE',
      role: 'LANDLORD',
    },
    create: {
      organizationId: org.id,
      firstName: 'James',
      lastName: 'Mitchell',
      email: 'landlord@pms.com',
      phone: '+1-555-0101',
      passwordHash: adminHash,
      emailVerified: true,
      status: 'ACTIVE',
      role: 'LANDLORD',
    },
  });

  const tenantData: Array<{ firstName: string; lastName: string; email: string; phone: string }> = [
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@tenant.com', phone: '+1-555-0201' },
    { firstName: 'Michael', lastName: 'Chen', email: 'michael@tenant.com', phone: '+1-555-0202' },
    { firstName: 'Emily', lastName: 'Rodriguez', email: 'emily@tenant.com', phone: '+1-555-0203' },
    { firstName: 'David', lastName: 'Kim', email: 'david@tenant.com', phone: '+1-555-0204' },
    { firstName: 'Lisa', lastName: 'Patel', email: 'lisa@tenant.com', phone: '+1-555-0205' },
    { firstName: 'Grace', lastName: 'Thompson', email: 'grace@tenant.com', phone: '+1-555-0206' },
    { firstName: 'Daniel', lastName: 'Owens', email: 'daniel@tenant.com', phone: '+1-555-0207' },
    { firstName: 'Noah', lastName: 'Martin', email: 'noah@tenant.com', phone: '+1-555-0208' },
    { firstName: 'Ava', lastName: 'Lopez', email: 'ava@tenant.com', phone: '+1-555-0209' },
    { firstName: 'Sofia', lastName: 'Ngugi', email: 'sofia@tenant.com', phone: '+1-555-0210' },
    { firstName: 'Ethan', lastName: 'Wanjiku', email: 'ethan@tenant.com', phone: '+1-555-0211' },
    { firstName: 'Maya', lastName: 'Kariuki', email: 'maya@tenant.com', phone: '+1-555-0212' },
    { firstName: 'Liam', lastName: 'Njoroge', email: 'liam@tenant.com', phone: '+1-555-0213' },
    { firstName: 'Chloe', lastName: 'Akinyi', email: 'chloe@tenant.com', phone: '+1-555-0214' },
    { firstName: 'Owen', lastName: 'Mugo', email: 'owen@tenant.com', phone: '+1-555-0215' },
    { firstName: 'Amelia', lastName: 'Muthoni', email: 'amelia@tenant.com', phone: '+1-555-0216' },
    { firstName: 'Lucas', lastName: 'Ochieng', email: 'lucas@tenant.com', phone: '+1-555-0217' },
    { firstName: 'Harper', lastName: 'Mutua', email: 'harper@tenant.com', phone: '+1-555-0218' },
    { firstName: 'Henry', lastName: 'Wambua', email: 'henry@tenant.com', phone: '+1-555-0219' },
    { firstName: 'Ella', lastName: 'Kiptoo', email: 'ella@tenant.com', phone: '+1-555-0220' },
  ];

  const tenantHash = await hash(PASSWORD);
  const tenantUsers: Array<{ id: string; firstName: string; lastName: string }> = [];
  for (const t of tenantData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {
        organizationId: org.id,
        firstName: t.firstName,
        lastName: t.lastName,
        phone: t.phone,
        passwordHash: tenantHash,
        emailVerified: true,
        status: 'ACTIVE',
        role: 'TENANT',
      },
      create: {
        organizationId: org.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        passwordHash: tenantHash,
        emailVerified: true,
        status: 'ACTIVE',
        role: 'TENANT',
      },
    });
    tenantUsers.push(user);
  }

  const vendorData = [
    {
      firstName: 'Robert',
      lastName: 'Okafor',
      email: 'robert@vendor.com',
      phone: '+1-555-0301',
      company: 'Okafor Plumbing',
    },
    {
      firstName: 'Angela',
      lastName: 'Torres',
      email: 'angela@vendor.com',
      phone: '+1-555-0302',
      company: 'Torres Electric Co.',
    },
  ];

  const vendorHash = await hash(PASSWORD);
  const vendorUsers: Array<{
    user: { id: string; firstName: string; lastName: string };
    company: string;
  }> = [];
  for (const v of vendorData) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: {
        organizationId: org.id,
        firstName: v.firstName,
        lastName: v.lastName,
        phone: v.phone,
        passwordHash: vendorHash,
        emailVerified: true,
        status: 'ACTIVE',
        role: 'VENDOR',
      },
      create: {
        organizationId: org.id,
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phone: v.phone,
        passwordHash: vendorHash,
        emailVerified: true,
        status: 'ACTIVE',
        role: 'VENDOR',
      },
    });
    vendorUsers.push({ user, company: v.company });
  }

  console.log(`Users: 1 landlord, ${tenantUsers.length} tenants, ${vendorUsers.length} vendors`);

  // 3. Tenant & Vendor profiles
  const tenants: Array<{ id: string; user: { id: string; firstName: string; lastName: string } }> =
    [];
  for (const u of tenantUsers) {
    const existingTenant = await prisma.tenant.findFirst({ where: { userId: u.id } });
    const t = existingTenant ?? (await prisma.tenant.create({ data: { userId: u.id } }));
    tenants.push({ id: t.id, user: u });
  }

  const vendors: Array<{ id: string; user: { id: string; firstName: string; lastName: string } }> =
    [];
  for (const { user, company } of vendorUsers) {
    const existingVendor = await prisma.vendor.findFirst({ where: { userId: user.id } });
    const v =
      existingVendor ??
      (await prisma.vendor.create({ data: { userId: user.id, companyName: company } }));
    vendors.push({ id: v.id, user });
  }

  console.log(`Tenant profiles: ${tenants.length}, Vendor profiles: ${vendors.length}`);

  // 4. Properties
  const propertyData = [
    {
      name: 'Sunrise Apartments',
      code: 'SRA-001',
      description: 'Modern 3-story apartment building in downtown',
      addressLine1: '123 Main Street',
      city: 'Nairobi',
      county: 'Nairobi County',
      postalCode: '00100',
    },
    {
      name: 'Greenfield Residences',
      code: 'GFR-002',
      description: 'Luxury residential complex with garden views',
      addressLine1: '456 Park Avenue',
      city: 'Mombasa',
      county: 'Mombasa County',
      postalCode: '80100',
    },
    {
      name: 'CityView Tower',
      code: 'CVT-003',
      description: 'High-rise commercial and residential tower',
      addressLine1: '789 Business Road',
      city: 'Kisumu',
      county: 'Kisumu County',
      postalCode: '40100',
    },
  ];

  const properties: Array<{ id: string }> = [];
  for (const p of propertyData) {
    const prop = await prisma.property.create({
      data: { ...p, organizationId: org.id },
    });
    properties.push(prop);
  }
  console.log(`Properties: ${properties.length}`);

  // 5. Units
  const unitData = [
    // Sunrise Apartments
    {
      propertyId: properties[0].id,
      unitNumber: 'A101',
      floor: '1',
      bedrooms: 2,
      bathrooms: 1,
      monthlyRent: 35000,
      securityDeposit: 70000,
      vacant: false,
    },
    {
      propertyId: properties[0].id,
      unitNumber: 'A102',
      floor: '1',
      bedrooms: 1,
      bathrooms: 1,
      monthlyRent: 22000,
      securityDeposit: 44000,
      vacant: false,
    },
    {
      propertyId: properties[0].id,
      unitNumber: 'A201',
      floor: '2',
      bedrooms: 3,
      bathrooms: 2,
      monthlyRent: 55000,
      securityDeposit: 110000,
      vacant: true,
    },
    {
      propertyId: properties[0].id,
      unitNumber: 'A202',
      floor: '2',
      bedrooms: 2,
      bathrooms: 1,
      monthlyRent: 32000,
      securityDeposit: 64000,
      vacant: false,
    },
    // Greenfield Residences
    {
      propertyId: properties[1].id,
      unitNumber: 'B101',
      floor: '1',
      bedrooms: 2,
      bathrooms: 2,
      monthlyRent: 45000,
      securityDeposit: 90000,
      vacant: false,
    },
    {
      propertyId: properties[1].id,
      unitNumber: 'B102',
      floor: '1',
      bedrooms: 1,
      bathrooms: 1,
      monthlyRent: 28000,
      securityDeposit: 56000,
      vacant: true,
    },
    {
      propertyId: properties[1].id,
      unitNumber: 'B201',
      floor: '2',
      bedrooms: 3,
      bathrooms: 2,
      monthlyRent: 60000,
      securityDeposit: 120000,
      vacant: false,
    },
    // CityView Tower
    {
      propertyId: properties[2].id,
      unitNumber: 'C101',
      floor: '1',
      bedrooms: 1,
      bathrooms: 1,
      monthlyRent: 25000,
      securityDeposit: 50000,
      vacant: false,
    },
    {
      propertyId: properties[2].id,
      unitNumber: 'C201',
      floor: '2',
      bedrooms: 2,
      bathrooms: 1,
      monthlyRent: 38000,
      securityDeposit: 76000,
      vacant: true,
    },
    {
      propertyId: properties[2].id,
      unitNumber: 'C301',
      floor: '3',
      bedrooms: 4,
      bathrooms: 3,
      monthlyRent: 80000,
      securityDeposit: 160000,
      vacant: false,
    },
  ];

  const units: Array<{
    id: string;
    propertyId: string;
    monthlyRent: Prisma.Decimal;
    unitNumber: string;
  }> = [];
  for (const u of unitData) {
    const unit = await prisma.unit.create({ data: u });
    units.push(unit);
  }

  // Update totalUnits on each property
  for (const prop of properties) {
    const count = await prisma.unit.count({ where: { propertyId: prop.id } });
    await prisma.property.update({ where: { id: prop.id }, data: { totalUnits: count } });
  }
  console.log(`Units: ${units.length} (across ${properties.length} properties)`);

  // 6. Assign tenants to units for a fuller occupancy snapshot
  const assignedTenants: Array<{
    id: string;
    user: { id: string; firstName: string; lastName: string };
    propertyId: string;
    unitId: string;
  }> = [];
  for (let index = 0; index < Math.min(tenants.length, units.length); index += 1) {
    const tenant = tenants[index];
    const unit = units[index];
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        propertyId: unit.propertyId,
        unitId: unit.id,
      },
    });
    await prisma.unit.update({
      where: { id: unit.id },
      data: { vacant: false },
    });
    assignedTenants.push({
      id: updatedTenant.id,
      user: tenant.user,
      propertyId: unit.propertyId,
      unitId: unit.id,
    });
    tenants[index] = { id: updatedTenant.id, user: tenant.user };
  }

  // 7. Invoices (monthly rent and recurring charges)
  const invoices: Array<{
    id: string;
    tenant: { id: string; user?: { id: string } };
    propertyId: string;
    unitId: string;
    totalAmount: Prisma.Decimal | number;
    amount: Prisma.Decimal | number;
    invoiceNumber: string;
    unit: { id: string; propertyId: string; monthlyRent: Prisma.Decimal; unitNumber: string };
  }> = [];
  const invoiceStatuses = [
    'PAID',
    'PAID',
    'PAID',
    'SENT',
    'SENT',
    'OVERDUE',
    'SENT',
    'OVERDUE',
    'PARTIAL',
    'SENT',
    'OVERDUE',
    'SENT',
  ] as const;
  let invCounter = 1;
  for (let i = 0; i < Math.min(assignedTenants.length, 12); i += 1) {
    const tenant = assignedTenants[i];
    const unit = units[i];
    const dueDate = new Date('2026-08-01');
    dueDate.setDate(dueDate.getDate() + i * 7);
    const amount = Number(unit.monthlyRent) + i * 1500;
    const tax = Number(amount) * 0.16;
    const totalAmount = Number(amount) + tax;
    const status = invoiceStatuses[i % invoiceStatuses.length];
    const inv = await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        propertyId: unit.propertyId,
        unitId: unit.id,
        invoiceNumber: `INV-2026-${String(invCounter++).padStart(4, '0')}`,
        dueDate,
        amount,
        tax,
        totalAmount,
        description:
          i % 3 === 0
            ? `Monthly rent for ${unit.unitNumber}`
            : i % 3 === 1
              ? `Service charge for ${unit.unitNumber}`
              : `Recurring bill for ${unit.unitNumber}`,
        status,
      },
    });
    invoices.push({ ...inv, tenant, unit });
  }
  console.log(`Invoices: ${invoices.length}`);

  // 8. Payments (for first 6 invoices)
  const paymentMethods: Array<'BANK_TRANSFER' | 'M_PESA' | 'CASH' | 'CREDIT_CARD'> = [
    'M_PESA',
    'BANK_TRANSFER',
    'CASH',
    'M_PESA',
    'CREDIT_CARD',
    'BANK_TRANSFER',
  ];
  const payments: Array<{ status: string }> = [];
  for (let i = 0; i < Math.min(6, invoices.length); i += 1) {
    const inv = invoices[i];
    const pymt = await prisma.payment.create({
      data: {
        invoiceId: inv.id,
        tenantId: inv.tenant.id,
        propertyId: inv.propertyId,
        unitId: inv.unitId,
        amount: inv.totalAmount,
        method: paymentMethods[i],
        reference: `PAY-${String(i + 1).padStart(4, '0')}`,
        status: i < 3 ? 'PAID' : 'PENDING',
        paidAt: i < 3 ? new Date() : null,
        notes: `Payment for ${inv.invoiceNumber}`,
      },
    });
    payments.push(pymt);

    if (i < 3) {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { status: 'PAID' },
      });
    }
  }
  console.log(
    `Payments: ${payments.length} (${payments.filter((p) => p.status === 'PAID').length} paid)`,
  );

  // 9. Maintenance requests
  const maintenanceData = [
    {
      propertyId: properties[0].id,
      unitId: units[0].id,
      tenantId: tenants[0].id,
      title: 'Leaking Kitchen Faucet',
      description:
        'The kitchen faucet has been dripping constantly for the past week. Water is pooling under the sink.',
      priority: 'HIGH' as const,
      status: 'ASSIGNED' as const,
      vendorId: vendors[0].id,
      cost: 3500,
    },
    {
      propertyId: properties[0].id,
      unitId: units[1].id,
      tenantId: tenants[1].id,
      title: 'Broken Air Conditioner',
      description: 'The AC unit in the living room stopped cooling. It runs but blows warm air.',
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS' as const,
      vendorId: vendors[1].id,
      cost: 12000,
    },
    {
      propertyId: properties[1].id,
      unitId: units[4].id,
      tenantId: tenants[2].id,
      title: 'Clogged Bathroom Drain',
      description:
        'The shower drain is draining very slowly. Tried chemical cleaners but no improvement.',
      priority: 'MEDIUM' as const,
      status: 'OPEN' as const,
      vendorId: null,
      cost: null,
    },
    {
      propertyId: properties[1].id,
      unitId: units[6].id,
      tenantId: tenants[3].id,
      title: 'Electrical Outlet Not Working',
      description: 'The power outlet in the bedroom has stopped working. No power at all.',
      priority: 'EMERGENCY' as const,
      status: 'ASSIGNED' as const,
      vendorId: vendors[1].id,
      cost: 5000,
    },
    {
      propertyId: properties[2].id,
      unitId: units[7].id,
      tenantId: tenants[4].id,
      title: 'Paint Touch-up Needed',
      description: 'Scuff marks and scratches on the living room walls after moving furniture.',
      priority: 'LOW' as const,
      status: 'COMPLETED' as const,
      vendorId: vendors[0].id,
      cost: 2000,
      completedDate: new Date('2026-07-20'),
    },
  ];

  const maintRequests: Array<{ id: string }> = [];
  for (const m of maintenanceData) {
    const req = await prisma.maintenanceRequest.create({ data: m });
    maintRequests.push(req);
  }
  console.log(`Maintenance requests: ${maintRequests.length}`);

  // 10. Notifications
  const notificationData = [
    {
      userId: landlord.id,
      title: 'Welcome to CityView Properties',
      message: 'Your account has been set up. Start by managing your properties.',
      isRead: true,
    },
    {
      userId: tenants[0].user.id,
      title: 'Invoice Generated',
      message: 'Your July rent invoice (INV-2026-0001) is ready for payment.',
      isRead: false,
    },
    {
      userId: tenants[0].user.id,
      title: 'Payment Received',
      message: 'Payment of KES 40,600 received for invoice INV-2026-0001.',
      isRead: true,
    },
    {
      userId: landlord.id,
      title: 'New Maintenance Request',
      message: 'Leaking Kitchen Faucet reported in Unit A101, Sunrise Apartments.',
      isRead: false,
    },
    {
      userId: tenants[1].user.id,
      title: 'Maintenance Update',
      message: 'Your AC repair request has been assigned to Torres Electric Co.',
      isRead: false,
    },
    {
      userId: landlord.id,
      title: 'Payment Received',
      message: 'M-PESA payment of KES 25,520 received from Michael Chen.',
      isRead: false,
    },
  ];

  for (const n of notificationData) {
    await prisma.notification.create({ data: n });
  }
  console.log(`Notifications: ${notificationData.length}`);

  // 11. Documents
  const documentData = [
    {
      name: 'Lease Agreement - A101',
      url: '/docs/lease-a101.pdf',
      category: 'LEASE' as const,
      fileType: 'application/pdf',
      size: 245000,
      entityId: units[0].id,
      entityType: 'Unit',
      uploadedBy: landlord.id,
    },
    {
      name: 'Property Inspection Report',
      url: '/docs/inspection-sra.pdf',
      category: 'PROPERTY' as const,
      fileType: 'application/pdf',
      size: 1200000,
      entityId: properties[0].id,
      entityType: 'Property',
      uploadedBy: landlord.id,
    },
    {
      name: 'Insurance Certificate',
      url: '/docs/insurance-gfr.pdf',
      category: 'INSURANCE' as const,
      fileType: 'application/pdf',
      size: 890000,
      entityId: properties[1].id,
      entityType: 'Property',
      uploadedBy: landlord.id,
    },
    {
      name: 'Vendor Contract - Okafor Plumbing',
      url: '/docs/vendor-okfor.pdf',
      category: 'VENDOR' as const,
      fileType: 'application/pdf',
      size: 340000,
      entityId: vendors[0].id,
      entityType: 'Vendor',
      uploadedBy: landlord.id,
    },
  ];

  for (const d of documentData) {
    await prisma.document.create({ data: d });
  }
  console.log(`Documents: ${documentData.length}`);

  console.log('\n--- Seed Complete ---');
  console.log('\nTEST CREDENTIALS (all passwords: Password123!):');
  console.log('─'.repeat(55));
  console.log('LANDLORD:');
  console.log('  Email: landlord@pms.com');
  console.log('');
  console.log('TENANTS:');
  for (const t of tenantData) {
    console.log(`  Email: ${t.email}`);
  }
  console.log('');
  console.log('VENDORS:');
  for (const v of vendorData) {
    console.log(`  Email: ${v.email}`);
  }
  console.log('─'.repeat(55));
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
