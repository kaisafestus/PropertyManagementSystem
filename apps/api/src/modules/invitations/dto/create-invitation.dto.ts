import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: [UserRole.TENANT, UserRole.VENDOR],
    example: UserRole.TENANT,
  })
  @IsEnum([UserRole.TENANT, UserRole.VENDOR])
  role!: UserRole;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+1-555-0100', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
