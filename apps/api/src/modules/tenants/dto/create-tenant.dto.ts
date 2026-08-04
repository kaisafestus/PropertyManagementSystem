import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant email address',
    example: 'tenant@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Phone number', example: '+254712345678' })
  @IsString()
  @Length(10, 20)
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid phone number (10-20 characters)',
  })
  phone!: string;

  @ApiProperty({ description: 'Organization ID', example: 'org_123' })
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @ApiPropertyOptional({ description: 'Property ID', example: 'prop_123' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 'unit_123' })
  @IsOptional()
  @IsString()
  unitId?: string;
}
