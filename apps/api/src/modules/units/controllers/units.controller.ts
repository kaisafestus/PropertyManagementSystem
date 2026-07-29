import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { UnitsService } from '../services/units.service';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';

@ApiTags('Units')
@ApiBearerAuth()
@Controller({ path: 'units', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Unit created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or property not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN role',
  })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of all units' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.unitsService.findAll(organizationId);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get units by property' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Units found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findByProperty(@Param('propertyId') propertyId: string) {
    return this.unitsService.findByProperty(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unit found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Unit not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.unitsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Update a unit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unit updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Unit not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or property not found',
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN role',
  })
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unit deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Unit not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires ADMIN role',
  })
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
