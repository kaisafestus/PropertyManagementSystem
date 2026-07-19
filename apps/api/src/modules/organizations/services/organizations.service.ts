import { Injectable } from '@nestjs/common';
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
}
