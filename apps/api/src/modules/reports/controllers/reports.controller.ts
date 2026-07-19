import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
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
import { ReportsService } from '../services/reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller({ path: 'reports', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard stats retrieved',
  })
  getDashboard(@CurrentUser('organizationId') organizationId: string) {
    return this.reportsService.getDashboardStats(organizationId);
  }

  @Get('financial')
  @ApiOperation({ summary: 'Get financial report' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Financial report generated',
  })
  getFinancialReport(
    @CurrentUser('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getFinancialReport(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Get maintenance report' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Maintenance report generated',
  })
  getMaintenanceReport(
    @CurrentUser('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getMaintenanceReport(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get occupancy report' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Occupancy report generated',
  })
  getOccupancyReport(@CurrentUser('organizationId') organizationId: string) {
    return this.reportsService.getOccupancyReport(organizationId);
  }
}
