import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { TenantsRepository } from '../repositories/tenants.repository';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { UsersService } from '../../users/services/users.service';
import { PasswordService } from '../../../common/services/password.service';

@Injectable()
export class TenantsService {
  constructor(
    private readonly tenantsRepository: TenantsRepository,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    const {
      email,
      firstName,
      lastName,
      phone,
      organizationId,
      propertyId,
      unitId,
    } = createTenantDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const defaultPassword = 'Password123!';
    const passwordHash = await this.passwordService.hash(defaultPassword);

    const user = await this.usersService.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      organization: { connect: { id: organizationId } },
      role: UserRole.TENANT,
      emailVerified: true,
      status: 'ACTIVE',
    });

    const tenant = await this.tenantsRepository.create({
      user: { connect: { id: user.id } },
      property: propertyId ? { connect: { id: propertyId } } : undefined,
      unit: unitId ? { connect: { id: unitId } } : undefined,
    });

    return this.tenantsRepository.findById(tenant.id);
  }

  findAll(organizationId: string) {
    return this.tenantsRepository.findAll(organizationId);
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
    const tenant = await this.findById(id);

    const userData: Prisma.UserUpdateInput = {};
    if (updateTenantDto.firstName !== undefined)
      userData.firstName = updateTenantDto.firstName;
    if (updateTenantDto.lastName !== undefined)
      userData.lastName = updateTenantDto.lastName;
    if (updateTenantDto.email !== undefined)
      userData.email = updateTenantDto.email;
    if (updateTenantDto.phone !== undefined)
      userData.phone = updateTenantDto.phone;

    if (Object.keys(userData).length > 0) {
      await this.usersService.update(tenant.userId, userData);
    }

    return this.tenantsRepository.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    return this.tenantsRepository.remove(id);
  }
}
