import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, MaintenanceStatus } from '@prisma/client';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  async create(createMaintenanceDto: CreateMaintenanceDto) {
    try {
      const data: Prisma.MaintenanceRequestCreateInput = {
        title: createMaintenanceDto.title,
        description: createMaintenanceDto.description,
        priority: createMaintenanceDto.priority,
        status: createMaintenanceDto.status || MaintenanceStatus.OPEN,
        scheduledDate: createMaintenanceDto.scheduledDate
          ? new Date(createMaintenanceDto.scheduledDate)
          : null,
        cost: createMaintenanceDto.cost,
        notes: createMaintenanceDto.notes,
        property: { connect: { id: createMaintenanceDto.propertyId } },
        unit: createMaintenanceDto.unitId
          ? { connect: { id: createMaintenanceDto.unitId } }
          : undefined,
        tenant: createMaintenanceDto.tenantId
          ? { connect: { id: createMaintenanceDto.tenantId } }
          : undefined,
        vendor: createMaintenanceDto.vendorId
          ? { connect: { id: createMaintenanceDto.vendorId } }
          : undefined,
      };

      return await this.maintenanceRepository.create(data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Property, Unit, Tenant, or Vendor not found',
          );
        }
      }
      throw error;
    }
  }

  findAll() {
    return this.maintenanceRepository.findAll();
  }

  findByProperty(propertyId: string) {
    return this.maintenanceRepository.findByProperty(propertyId);
  }

  findByVendor(vendorId: string) {
    return this.maintenanceRepository.findByVendor(vendorId);
  }

  findByStatus(status: string) {
    return this.maintenanceRepository.findByStatus(status);
  }

  async findById(id: string) {
    const request = await this.maintenanceRepository.findById(id);
    if (!request)
      throw new NotFoundException(
        `Maintenance request with ID ${id} not found`,
      );
    return request;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto) {
    await this.findById(id);
    try {
      const data: Prisma.MaintenanceRequestUpdateInput = {
        title: updateMaintenanceDto.title,
        description: updateMaintenanceDto.description,
        priority: updateMaintenanceDto.priority,
        status: updateMaintenanceDto.status,
        scheduledDate: updateMaintenanceDto.scheduledDate
          ? new Date(updateMaintenanceDto.scheduledDate)
          : undefined,
        cost: updateMaintenanceDto.cost,
        notes: updateMaintenanceDto.notes,
        property: updateMaintenanceDto.propertyId
          ? { connect: { id: updateMaintenanceDto.propertyId } }
          : undefined,
        unit: updateMaintenanceDto.unitId
          ? { connect: { id: updateMaintenanceDto.unitId } }
          : undefined,
        tenant: updateMaintenanceDto.tenantId
          ? { connect: { id: updateMaintenanceDto.tenantId } }
          : undefined,
        vendor: updateMaintenanceDto.vendorId
          ? { connect: { id: updateMaintenanceDto.vendorId } }
          : undefined,
      };

      // If status is COMPLETED, set completedDate
      if (updateMaintenanceDto.status === 'COMPLETED') {
        data.completedDate = new Date();
      }

      return await this.maintenanceRepository.update(id, data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Property, Unit, Tenant, or Vendor not found',
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findById(id);
    return this.maintenanceRepository.remove(id);
  }
}
