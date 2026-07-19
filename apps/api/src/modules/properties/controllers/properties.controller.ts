import {
  Body,
  Controller,
  Get,
  Post,
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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

import { PropertiesService } from '../services/properties.service';
import { CreatePropertyDto } from '../dto/create-property.dto';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller({
  path: 'properties',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Property created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or duplicate property code',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN role',
  })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    console.log('=== CONTROLLER REACHED ===');
    console.log('organizationId:', organizationId);
    console.log('DTO:', createPropertyDto);
    return this.propertiesService.create(organizationId, createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all properties',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  findAll() {
    return this.propertiesService.findAll();
  }
}
