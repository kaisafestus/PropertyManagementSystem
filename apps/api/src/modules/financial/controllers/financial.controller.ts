import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { FinancialService } from '../services/financial.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@ApiTags('Financial')
@ApiBearerAuth()
@Controller({ path: 'financial', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // Invoice endpoints
  @Post('invoices')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create an invoice' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invoice created successfully',
  })
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.financialService.createInvoice(createInvoiceDto);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of all invoices' })
  findAllInvoices() {
    return this.financialService.findAllInvoices();
  }

  @Get('invoices/tenant/:tenantId')
  @ApiOperation({ summary: 'Get invoices by tenant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Invoices found' })
  findInvoicesByTenant(@Param('tenantId') tenantId: string) {
    return this.financialService.findInvoicesByTenant(tenantId);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Invoice found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  findInvoiceById(@Param('id') id: string) {
    return this.financialService.findInvoiceById(id);
  }

  @Patch('invoices/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice updated successfully',
  })
  updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.financialService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete('invoices/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice deleted successfully',
  })
  removeInvoice(@Param('id') id: string) {
    return this.financialService.removeInvoice(id);
  }

  // Payment endpoints
  @Post('payments')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
  })
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.financialService.createPayment(createPaymentDto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of all payments' })
  findAllPayments() {
    return this.financialService.findAllPayments();
  }

  @Get('payments/tenant/:tenantId')
  @ApiOperation({ summary: 'Get payments by tenant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payments found' })
  findPaymentsByTenant(@Param('tenantId') tenantId: string) {
    return this.financialService.findPaymentsByTenant(tenantId);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment found' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  findPaymentById(@Param('id') id: string) {
    return this.financialService.findPaymentById(id);
  }

  @Patch('payments/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment updated successfully',
  })
  updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.financialService.updatePayment(id, updatePaymentDto);
  }

  @Delete('payments/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment deleted successfully',
  })
  removePayment(@Param('id') id: string) {
    return this.financialService.removePayment(id);
  }
}
