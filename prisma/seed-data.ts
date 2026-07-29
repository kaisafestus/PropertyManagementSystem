import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const HASH_ROUNDS = 12;
const PASSWORD = 'Password123!';

async function hash(pw: string) {
  return bcrypt.hash(pw, HASH_ROUNDS);
}

async function main() {
  console.log('--- Property Management System Seed ---\n');

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      name: 'CityView Properties',
      email: 'admin@cityview.com',
      phone: '+1-555-0100',
      status: 'ACTIVE',
    },
  });
  console.log(`Organization: ${org.name} (${org.id})`);

  // 2. Users
  const adminHash = await hash(PASSWORD);
  const landlord = await prisma.user.create({
    data: {
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

  const tenantData = [
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@tenant.com', phone: '+1-555-0201' },
    { firstName: 'Michael', lastName: 'Chen', email: 'michael@tenant.com', phone: '+1-555-0202' },
    { firstName: 'Emily', lastName: 'Rodriguez', email: 'emily@tenant.com', phone: '+1-555-0203' },
    { firstName: 'David', lastName: 'Kim', email: 'david@tenant.com', phone: '+1-555-0204' },
    { firstName: 'Lisa', lastName: 'Patel', email: 'lisa@tenant.com', phone: '+1-555-0205' },
  ];

  const tenantHash = await hash(PASSWORD);
  const tenantUsers = [];
  for (const t of tenantData) {
    const user = await prisma.user.create({
      data: {
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
  const vendorUsers = [];
  for (const v of vendorData) {
    const user = await prisma.user.create({
      data: {
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
  const tenants = [];
  for (const u of tenantUsers) {
    const t = await prisma.tenant.create({ data: { userId: u.id } });
    tenants.push({ ...t, user: u });
  }

  const vendors = [];
  for (const { user, company } of vendorUsers) {
    const v = await prisma.vendor.create({ data: { userId: user.id, companyName: company } });
    vendors.push({ ...v, user });
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

  const properties = [];
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

  const units = [];
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

  // 6. Invoices (monthly rent for occupied units)
  const occupiedUnits = units.filter((u) => !u.vacant);
  const invoices = [];
  let invCounter = 1;
  for (let i = 0; i < occupiedUnits.length; i++) {
    const unit = occupiedUnits[i];
    const tenant = tenants[i % tenants.length];
    const inv = await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        propertyId: unit.propertyId,
        unitId: unit.id,
        invoiceNumber: `INV-2026-${String(invCounter++).padStart(4, '0')}`,
        dueDate: new Date('2026-08-01'),
        amount: unit.monthlyRent,
        tax: Number(unit.monthlyRent) * 0.16,
        totalAmount: Number(unit.monthlyRent) * 1.16,
        description: `Monthly rent for ${unit.unitNumber}`,
        status: 'SENT',
      },
    });
    invoices.push({ ...inv, tenant, unit });
  }
  console.log(`Invoices: ${invoices.length}`);

  // 7. Payments (for first 5 invoices)
  const paymentMethods: Array<'BANK_TRANSFER' | 'M_PESA' | 'CASH' | 'CREDIT_CARD'> = [
    'M_PESA',
    'BANK_TRANSFER',
    'CASH',
    'M_PESA',
    'CREDIT_CARD',
  ];
  const payments = [];
  for (let i = 0; i < Math.min(5, invoices.length); i++) {
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

  // 8. Maintenance requests
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

  const maintRequests = [];
  for (const m of maintenanceData) {
    const req = await prisma.maintenanceRequest.create({ data: m });
    maintRequests.push(req);
  }
  console.log(`Maintenance requests: ${maintRequests.length}`);

  // 9. Notifications
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

  // 10. Documents
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
