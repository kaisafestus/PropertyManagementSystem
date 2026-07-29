import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
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

import { TenantPortalService } from '../services/tenant-portal.service';

@ApiTags('Tenant Portal')
@ApiBearerAuth()
@Controller({ path: 'tenant-portal', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT)
export class TenantPortalController {
  constructor(private readonly tenantPortalService: TenantPortalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get tenant dashboard data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard data retrieved',
  })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getDashboard(userId);
  }

  @Get('lease')
  @ApiOperation({ summary: 'Get tenant lease information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lease information retrieved',
  })
  getLease(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getLease(userId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get tenant payment history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment history retrieved',
  })
  getPayments(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getPayments(userId);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Get tenant maintenance requests' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance requests retrieved',
  })
  getMaintenance(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getMaintenance(userId);
  }

  @Post('maintenance')
  @ApiOperation({ summary: 'Create a maintenance request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Maintenance request created',
  })
  createMaintenance(
    @CurrentUser('id') userId: string,
    @Body() body: { title: string; description: string; priority?: string },
  ) {
    return this.tenantPortalService.createMaintenanceRequest(userId, body);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get tenant documents' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Documents retrieved' })
  getDocuments(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getDocuments(userId);
  }

  @Get('notices')
  @ApiOperation({ summary: 'Get tenant notices' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notices retrieved' })
  getNotices(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getNotices(userId);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get tenant messages' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Messages retrieved' })
  getMessages(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getMessages(userId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get tenant profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile retrieved' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.tenantPortalService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update tenant profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile updated' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { phone?: string },
  ) {
    return this.tenantPortalService.updateProfile(userId, body);
  }
}
