import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { UsersService } from '../../users/services/users.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    return this.prisma.$transaction(async (tx) => {
      const organization = await this.organizationsService.create(
        {
          name: dto.organizationName,
          email: dto.email,
        },
        tx,
      );

      const user = await this.usersService.create(
        {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.ADMIN,
          organization: {
            connect: {
              id: organization.id,
            },
          },
        },
        tx,
      );

      const payload = {
        sub: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
      };

      const accessToken = await this.jwtService.signAsync(payload);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: user.organizationId,
          role: user.role,
        },
        accessToken,
      };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.passwordService.compare(
      dto.password,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        role: user.role,
      },
      accessToken,
    };
  }
}
