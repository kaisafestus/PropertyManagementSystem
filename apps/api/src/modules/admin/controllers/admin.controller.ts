import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
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
import { AdminService } from '../services/admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System stats retrieved' })
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('growth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user growth data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User growth data retrieved',
  })
  getUserGrowth() {
    return this.adminService.getUserGrowth();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System health status' })
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
}
