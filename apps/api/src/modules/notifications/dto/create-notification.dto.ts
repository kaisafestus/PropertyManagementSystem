import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Is read', default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
