import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PropertiesRepository } from '../repositories/properties.repository';
import { CreatePropertyDto } from '../dto/create-property.dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(private readonly propertiesRepository: PropertiesRepository) {}

  async create(organizationId: string, createPropertyDto: CreatePropertyDto) {
    console.log('=== SERVICE CREATE CALLED ===');
    console.log('organizationId (string):', organizationId);
    console.log('DTO:', JSON.stringify(createPropertyDto));

    this.logger.log(`Creating property for organization: ${organizationId}`);

    try {
      const data: Prisma.PropertyCreateInput = {
        organization: {
          connect: { id: organizationId },
        },
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

      console.log('Prisma data:', JSON.stringify(data));

      const result = await this.propertiesRepository.create(data);
      console.log('Result:', JSON.stringify(result));
      return result;
    } catch (error: unknown) {
      const err = error as Error;
      console.error('=== ERROR IN SERVICE ===');
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
      this.logger.error(`Error creating property: ${err.message}`);
      this.logger.error(err.stack);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Property with this code already exists',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Organization not found');
        }
      }
      throw error;
    }
  }

  findAll() {
    return this.propertiesRepository.findAll();
  }

  findById(id: string) {
    return this.propertiesRepository.findById(id);
  }
}
