import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';

import { UsersService } from '../../users/services/users.service';
import { OrganizationsService } from '../../organizations/services/organizations.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; accessToken: string }> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordService.hash(password);

    let organization = await this.organizationsService.findFirst();
    if (!organization) {
      organization = await this.organizationsService.create({
        name: `${firstName}'s Organization`,
        email: email,
      });
    }

    const user = await this.usersService.create({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      organization: {
        connect: { id: organization.id },
      },
      role: UserRole.ADMIN,
    });

    const accessToken = this.generateToken(user);

    return { user, accessToken };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; accessToken: string }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.generateToken(user);

    return { user, accessToken };
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
