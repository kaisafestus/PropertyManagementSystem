import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MaintenanceService } from '../services/maintenance.service';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller({ path: 'maintenance', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create a maintenance request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Maintenance request created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or related entity not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN role',
  })
  create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maintenance requests' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all maintenance requests',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.maintenanceService.findAll(organizationId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get maintenance requests by property' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance requests found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.maintenanceService.findByProperty(propertyId);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get maintenance requests by vendor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance requests found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findByVendor(@Param('vendorId') vendorId: string) {
    return this.maintenanceService.findByVendor(vendorId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get maintenance requests by status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance requests found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findByStatus(@Param('status') status: string) {
    return this.maintenanceService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance request by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance request found',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance request not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update a maintenance request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance request updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance request not found',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN role',
  })
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Delete(':id')
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete a maintenance request' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance request deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Maintenance request not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN role',
  })
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}
