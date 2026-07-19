import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PropertiesRepository } from '../repositories/properties.repository';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(private readonly propertiesRepository: PropertiesRepository) {}

  async create(organizationId: string, createPropertyDto: CreatePropertyDto) {
    try {
      const data: Prisma.PropertyCreateInput = {
        organization: { connect: { id: organizationId } },
        name: createPropertyDto.name,
        code: createPropertyDto.code,
        description: createPropertyDto.description,
        addressLine1: createPropertyDto.addressLine1,
        addressLine2: createPropertyDto.addressLine2 || null,
        city: createPropertyDto.city,
        county: createPropertyDto.county,
        postalCode: createPropertyDto.postalCode,
        active: createPropertyDto.active ?? true,
      };
      return await this.propertiesRepository.create(data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new BadRequestException(
            'Property with this code already exists',
          );
        if (error.code === 'P2003')
          throw new BadRequestException('Organization not found');
      }
      throw error;
    }
  }

  findAll() {
    return this.propertiesRepository.findAll();
  }

  async findById(id: string) {
    const property = await this.propertiesRepository.findById(id);
    if (!property)
      throw new NotFoundException(`Property with ID ${id} not found`);
    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    await this.findById(id);
    try {
      const data: Prisma.PropertyUpdateInput = {
        name: updatePropertyDto.name,
        code: updatePropertyDto.code,
        description: updatePropertyDto.description,
        addressLine1: updatePropertyDto.addressLine1,
        addressLine2: updatePropertyDto.addressLine2,
        city: updatePropertyDto.city,
        county: updatePropertyDto.county,
        postalCode: updatePropertyDto.postalCode,
        active: updatePropertyDto.active,
      };
      return await this.propertiesRepository.update(id, data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new BadRequestException(
            'Property with this code already exists',
          );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findById(id);
    return this.propertiesRepository.remove(id);
  }
}
