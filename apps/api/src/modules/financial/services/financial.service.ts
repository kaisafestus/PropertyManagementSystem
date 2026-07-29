import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, PaymentStatus, InvoiceStatus } from '@prisma/client';
import { FinancialRepository } from '../repositories/financial.repository';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Injectable()
export class FinancialService {
  constructor(private readonly financialRepository: FinancialRepository) {}

  // Invoice methods
  async createInvoice(createInvoiceDto: CreateInvoiceDto) {
    try {
      const totalAmount = createInvoiceDto.amount + (createInvoiceDto.tax || 0);
      const data: Prisma.InvoiceCreateInput = {
        invoiceNumber: createInvoiceDto.invoiceNumber,
        issueDate: new Date(),
        dueDate: new Date(createInvoiceDto.dueDate),
        amount: createInvoiceDto.amount,
        tax: createInvoiceDto.tax,
        totalAmount: totalAmount,
        description: createInvoiceDto.description,
        status: createInvoiceDto.status || InvoiceStatus.DRAFT,
        tenant: { connect: { id: createInvoiceDto.tenantId } },
        property: { connect: { id: createInvoiceDto.propertyId } },
        unit: { connect: { id: createInvoiceDto.unitId } },
      };
      return await this.financialRepository.createInvoice(data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new BadRequestException('Invoice number already exists');
        if (error.code === 'P2003')
          throw new BadRequestException('Tenant, Property, or Unit not found');
      }
      throw error;
    }
  }

  findAllInvoices(organizationId: string) {
    return this.financialRepository.findAllInvoices(organizationId);
  }

  async findInvoiceById(id: string) {
    const invoice = await this.financialRepository.findInvoiceById(id);
    if (!invoice)
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    return invoice;
  }

  findInvoicesByTenant(tenantId: string) {
    return this.financialRepository.findInvoicesByTenant(tenantId);
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    await this.findInvoiceById(id);
    try {
      const data: Prisma.InvoiceUpdateInput = {
        invoiceNumber: updateInvoiceDto.invoiceNumber,
        dueDate: updateInvoiceDto.dueDate
          ? new Date(updateInvoiceDto.dueDate)
          : undefined,
        amount: updateInvoiceDto.amount,
        tax: updateInvoiceDto.tax,
        totalAmount:
          updateInvoiceDto.amount && updateInvoiceDto.tax !== undefined
            ? updateInvoiceDto.amount + updateInvoiceDto.tax
            : undefined,
        description: updateInvoiceDto.description,
        status: updateInvoiceDto.status,
        tenant: updateInvoiceDto.tenantId
          ? { connect: { id: updateInvoiceDto.tenantId } }
          : undefined,
        property: updateInvoiceDto.propertyId
          ? { connect: { id: updateInvoiceDto.propertyId } }
          : undefined,
        unit: updateInvoiceDto.unitId
          ? { connect: { id: updateInvoiceDto.unitId } }
          : undefined,
      };
      return await this.financialRepository.updateInvoice(id, data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new BadRequestException('Invoice number already exists');
        if (error.code === 'P2003')
          throw new BadRequestException('Tenant, Property, or Unit not found');
      }
      throw error;
    }
  }

  async removeInvoice(id: string) {
    await this.findInvoiceById(id);
    return this.financialRepository.removeInvoice(id);
  }

  // Payment methods
  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const data: Prisma.PaymentCreateInput = {
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        reference: createPaymentDto.reference,
        status: createPaymentDto.status || PaymentStatus.PENDING,
        notes: createPaymentDto.notes,
        paidAt:
          createPaymentDto.status === PaymentStatus.PAID ? new Date() : null,
        invoice: { connect: { id: createPaymentDto.invoiceId } },
        tenant: { connect: { id: createPaymentDto.tenantId } },
        property: { connect: { id: createPaymentDto.propertyId } },
        unit: { connect: { id: createPaymentDto.unitId } },
      };

      const payment = await this.financialRepository.createPayment(data);

      // Update invoice status based on payments
      await this.updateInvoicePaymentStatus(createPaymentDto.invoiceId);

      return payment;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new BadRequestException(
            'Invoice, Tenant, Property, or Unit not found',
          );
      }
      throw error;
    }
  }

  private async updateInvoicePaymentStatus(invoiceId: string) {
    const invoice = await this.financialRepository.findInvoiceById(invoiceId);
    if (!invoice) return;

    const totalPaid = invoice.payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    let status: InvoiceStatus;
    if (totalPaid >= Number(invoice.totalAmount)) {
      status = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      status = InvoiceStatus.PARTIAL;
    } else if (new Date(invoice.dueDate) < new Date()) {
      status = InvoiceStatus.OVERDUE;
    } else {
      status = InvoiceStatus.SENT;
    }

    await this.financialRepository.updateInvoice(invoiceId, { status });
  }

  findAllPayments(organizationId: string) {
    return this.financialRepository.findAllPayments(organizationId);
  }

  async findPaymentById(id: string) {
    const payment = await this.financialRepository.findPaymentById(id);
    if (!payment)
      throw new NotFoundException(`Payment with ID ${id} not found`);
    return payment;
  }

  findPaymentsByTenant(tenantId: string) {
    return this.financialRepository.findPaymentsByTenant(tenantId);
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {
    await this.findPaymentById(id);
    try {
      const data: Prisma.PaymentUpdateInput = {
        amount: updatePaymentDto.amount,
        method: updatePaymentDto.method,
        reference: updatePaymentDto.reference,
        status: updatePaymentDto.status,
        notes: updatePaymentDto.notes,
        paidAt:
          updatePaymentDto.status === PaymentStatus.PAID
            ? new Date()
            : undefined,
        invoice: updatePaymentDto.invoiceId
          ? { connect: { id: updatePaymentDto.invoiceId } }
          : undefined,
        tenant: updatePaymentDto.tenantId
          ? { connect: { id: updatePaymentDto.tenantId } }
          : undefined,
        property: updatePaymentDto.propertyId
          ? { connect: { id: updatePaymentDto.propertyId } }
          : undefined,
        unit: updatePaymentDto.unitId
          ? { connect: { id: updatePaymentDto.unitId } }
          : undefined,
      };

      const payment = await this.financialRepository.updatePayment(id, data);

      // Update invoice status if invoice changed or status changed
      if (updatePaymentDto.invoiceId || updatePaymentDto.status) {
        const invoiceId =
          updatePaymentDto.invoiceId ||
          (await this.findPaymentById(id)).invoiceId;
        await this.updateInvoicePaymentStatus(invoiceId);
      }

      return payment;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new BadRequestException(
            'Invoice, Tenant, Property, or Unit not found',
          );
      }
      throw error;
    }
  }

  async removePayment(id: string) {
    const payment = await this.findPaymentById(id);
    await this.financialRepository.removePayment(id);
    // Update invoice status after payment removal
    await this.updateInvoicePaymentStatus(payment.invoiceId);
    return { message: 'Payment deleted successfully' };
  }
}
