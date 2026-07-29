import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  create(data: Prisma.UserCreateInput, tx?: Prisma.TransactionClient) {
    return this.usersRepository.create(data, tx);
  }

  updateLastLogin(id: string) {
    return this.usersRepository.updateLastLogin(id);
  }

  updateFailedAttempts(id: string, attempts: number) {
    return this.usersRepository.updateFailedAttempts(id, attempts);
  }

  updateLockout(id: string, attempts: number, lockedUntil: Date) {
    return this.usersRepository.updateLockout(id, attempts, lockedUntil);
  }

  findAll(organizationId: string) {
    return this.usersRepository.findAll(organizationId);
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.usersRepository.update(id, data);
  }

  remove(id: string) {
    return this.usersRepository.remove(id);
  }
}
