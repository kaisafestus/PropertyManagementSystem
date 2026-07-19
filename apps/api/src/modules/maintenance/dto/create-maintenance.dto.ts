import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty({ description: 'Property ID' })
  @IsString()
  propertyId: string;

  @ApiPropertyOptional({ description: 'Unit ID' })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Tenant ID' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Vendor ID' })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(MaintenancePriority)
  priority?: MaintenancePriority;

  @ApiPropertyOptional({
    enum: MaintenanceStatus,
    default: MaintenanceStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ description: 'Scheduled date' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
