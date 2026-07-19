import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentCategory } from '@prisma/client';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Document URL' })
  @IsString()
  url: string;

  @ApiProperty({ enum: DocumentCategory })
  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @ApiProperty({ description: 'File type' })
  @IsString()
  fileType: string;

  @ApiProperty({ description: 'File size' })
  @IsNumber()
  size: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Entity ID (property, tenant, etc.)' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'Entity type (e.g., Property, Tenant)' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Uploaded by user ID' })
  @IsString()
  uploadedBy: string;
}
