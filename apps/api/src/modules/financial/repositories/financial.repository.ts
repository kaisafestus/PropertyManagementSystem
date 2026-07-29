import { Injectable } from '@nestjs/common';
import { Prisma, Invoice, Payment, Expense } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class FinancialRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Invoice methods
  createInvoice(data: Prisma.InvoiceCreateInput): Promise<Invoice> {
    return this.prisma.invoice.create({
      data,
      include: { tenant: true, property: true, unit: true, payments: true },
    });
  }

  findAllInvoices(organizationId: string) {
    return this.prisma.invoice.findMany({
      where: { property: { organizationId } },
      orderBy: { createdAt: 'desc' },
      include: { tenant: true, property: true, unit: true, payments: true },
    });
  }

  findInvoiceById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { tenant: true, property: true, unit: true, payments: true },
    });
  }

  findInvoicesByTenant(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { tenant: true, property: true, unit: true, payments: true },
    });
  }

  updateInvoice(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { tenant: true, property: true, unit: true, payments: true },
    });
  }

  removeInvoice(id: string): Promise<Invoice> {
    return this.prisma.invoice.delete({ where: { id } });
  }

  // Payment methods
  createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({
      data,
      include: { invoice: true, tenant: true, property: true, unit: true },
    });
  }

  findAllPayments(organizationId: string) {
    return this.prisma.payment.findMany({
      where: { property: { organizationId } },
      orderBy: { createdAt: 'desc' },
      include: { invoice: true, tenant: true, property: true, unit: true },
    });
  }

  findPaymentById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { invoice: true, tenant: true, property: true, unit: true },
    });
  }

  findPaymentsByTenant(tenantId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { invoice: true, tenant: true, property: true, unit: true },
    });
  }

  updatePayment(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data,
      include: { invoice: true, tenant: true, property: true, unit: true },
    });
  }

  removePayment(id: string): Promise<Payment> {
    return this.prisma.payment.delete({ where: { id } });
  }
}
