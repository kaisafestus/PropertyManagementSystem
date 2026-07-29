import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { VendorsRepository } from '../repositories/vendors.repository';
import { CreateVendorDto } from '../dto/create-vendor.dto';
import { UpdateVendorDto } from '../dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly vendorsRepository: VendorsRepository) {}

  async create(createVendorDto: CreateVendorDto) {
    try {
      const existingVendor = await this.vendorsRepository.findByUserId(
        createVendorDto.userId,
      );
      if (existingVendor) {
        throw new BadRequestException('User already has a vendor profile');
      }

      const data: Prisma.VendorCreateInput = {
        companyName: createVendorDto.companyName,
        user: { connect: { id: createVendorDto.userId } },
      };

      return await this.vendorsRepository.create(data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new BadRequestException('User not found');
      }
      throw error;
    }
  }

  findAll(organizationId: string) {
    return this.vendorsRepository.findAll(organizationId);
  }

  async findById(id: string) {
    const vendor = await this.vendorsRepository.findById(id);
    if (!vendor) throw new NotFoundException(`Vendor with ID ${id} not found`);
    return vendor;
  }

  async findByUserId(userId: string) {
    const vendor = await this.vendorsRepository.findByUserId(userId);
    if (!vendor)
      throw new NotFoundException(`Vendor with User ID ${userId} not found`);
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto) {
    await this.findById(id);
    try {
      const data: Prisma.VendorUpdateInput = {
        companyName: updateVendorDto.companyName,
        user: updateVendorDto.userId
          ? { connect: { id: updateVendorDto.userId } }
          : undefined,
      };
      return await this.vendorsRepository.update(id, data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003')
          throw new BadRequestException('User not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findById(id);
    return this.vendorsRepository.remove(id);
  }
}
