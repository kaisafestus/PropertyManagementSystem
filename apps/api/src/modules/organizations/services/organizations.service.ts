import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { OrganizationsRepository } from '../repositories/organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  create(data: Prisma.OrganizationCreateInput, tx?: Prisma.TransactionClient) {
    return this.organizationsRepository.create(data, tx);
  }

  findFirst() {
    return this.organizationsRepository.findFirst();
  }

  findAll() {
    return this.organizationsRepository.findAll();
  }

  async findById(id: string) {
    const org = await this.organizationsRepository.findById(id);
    if (!org)
      throw new NotFoundException(`Organization with ID ${id} not found`);
    return org;
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput) {
    await this.findById(id);
    return this.organizationsRepository.update(id, data);
  }
}
