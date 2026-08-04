import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Tenant ID' })
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Property ID' })
  @IsString()
  propertyId: string;

  @ApiProperty({ description: 'Unit ID' })
  @IsString()
  unitId: string;

  @ApiProperty({ description: 'Invoice number' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ description: 'Amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  @IsOptional()
  status?: InvoiceStatus;
}
