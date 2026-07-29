import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UnitsRepository } from '../repositories/units.repository';
import { CreateUnitDto } from '../dto/create-unit.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(private readonly unitsRepository: UnitsRepository) {}

  async create(createUnitDto: CreateUnitDto) {
    try {
      const data: Prisma.UnitCreateInput = {
        unitNumber: createUnitDto.unitNumber,
        floor: createUnitDto.floor,
        bedrooms: createUnitDto.bedrooms,
        bathrooms: createUnitDto.bathrooms,
        sizeSqFt: createUnitDto.sizeSqFt,
        monthlyRent: createUnitDto.monthlyRent,
        securityDeposit: createUnitDto.securityDeposit,
        vacant: createUnitDto.vacant ?? true,
        property: { connect: { id: createUnitDto.propertyId } },
      };
      return await this.unitsRepository.create(data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new BadRequestException('Property not found');
      }
      throw error;
    }
  }

  findAll(organizationId: string) {
    return this.unitsRepository.findAll(organizationId);
  }

  findByProperty(propertyId: string) {
    return this.unitsRepository.findByProperty(propertyId);
  }

  async findById(id: string) {
    const unit = await this.unitsRepository.findById(id);
    if (!unit) throw new NotFoundException(`Unit with ID ${id} not found`);
    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    await this.findById(id);
    try {
      const data: Prisma.UnitUpdateInput = {
        unitNumber: updateUnitDto.unitNumber,
        floor: updateUnitDto.floor,
        bedrooms: updateUnitDto.bedrooms,
        bathrooms: updateUnitDto.bathrooms,
        sizeSqFt: updateUnitDto.sizeSqFt,
        monthlyRent: updateUnitDto.monthlyRent,
        securityDeposit: updateUnitDto.securityDeposit,
        vacant: updateUnitDto.vacant,
        property: updateUnitDto.propertyId
          ? { connect: { id: updateUnitDto.propertyId } }
          : undefined,
      };
      return await this.unitsRepository.update(id, data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new BadRequestException('Property not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findById(id);
    return this.unitsRepository.remove(id);
  }
}
