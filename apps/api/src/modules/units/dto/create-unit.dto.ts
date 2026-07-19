import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ description: 'Property ID this unit belongs to' })
  @IsString()
  propertyId: string;

  @ApiProperty({ description: 'Unit number' })
  @IsString()
  unitNumber: string;

  @ApiPropertyOptional({ description: 'Floor number' })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ description: 'Number of bedrooms', minimum: 0 })
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty({ description: 'Number of bathrooms', minimum: 0 })
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiPropertyOptional({ description: 'Size in square feet' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeSqFt?: number;

  @ApiProperty({ description: 'Monthly rent amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty({ description: 'Security deposit amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  securityDeposit: number;

  @ApiPropertyOptional({
    description: 'Whether the unit is vacant',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  vacant?: boolean;
}
