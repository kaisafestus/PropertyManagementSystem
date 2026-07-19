import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TenantsRepository } from '../repositories/tenants.repository';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  async create(createTenantDto: CreateTenantDto) {
    try {
      // Check if user already has a tenant record
      const existingTenant = await this.tenantsRepository.findByUserId(
        createTenantDto.userId,
      );
      if (existingTenant) {
        throw new BadRequestException('User already has a tenant profile');
      }

      const data: Prisma.TenantCreateInput = {
        user: { connect: { id: createTenantDto.userId } },
      };

      return await this.tenantsRepository.create(data);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('User not found');
        }
      }
      throw error;
    }
  }

  findAll() {
    return this.tenantsRepository.findAll();
  }

  async findById(id: string) {
    const tenant = await this.tenantsRepository.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);
    return tenant;
  }

  async findByUserId(userId: string) {
    const tenant = await this.tenantsRepository.findByUserId(userId);
    if (!tenant)
      throw new NotFoundException(`Tenant with User ID ${userId} not found`);
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findById(id);
    try {
      const data: Prisma.TenantUpdateInput = {
        user: updateTenantDto.userId
          ? { connect: { id: updateTenantDto.userId } }
          : undefined,
      };
      return await this.tenantsRepository.update(id, data);
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
    return this.tenantsRepository.remove(id);
  }
}
