import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName: string;
}
