import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { PasswordService } from '../../../common/services/password.service';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly prisma: PrismaService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, firstName, lastName, organizationName, phone } =
      registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = await this.passwordService.hash(password);

    const organization = await this.prisma.organization.create({
      data: {
        name: organizationName,
        email,
        phone,
        status: 'ACTIVE',
      },
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        organizationId: organization.id,
        role: UserRole.LANDLORD,
        emailVerified: true,
        status: 'ACTIVE',
      },
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new UnauthorizedException('Account is suspended or inactive');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is locked. Try again in ${minutesLeft} minute(s)`,
      );
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const lockAfter = 5;

      if (newAttempts >= lockAfter) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 15);
        await this.usersService.updateLockout(user.id, newAttempts, lockUntil);
      } else {
        await this.usersService.updateFailedAttempts(user.id, newAttempts);
      }

      throw new BadRequestException('Invalid credentials');
    }

    await this.usersService.updateLastLogin(user.id);
    await this.usersService.updateFailedAttempts(user.id, 0);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const session = await this.prisma.userSession.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.userSession.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = session.user;

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new UnauthorizedException('Account is suspended or inactive');
    }

    await this.prisma.userSession.delete({ where: { id: session.id } });

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });
    return { message: 'Logged out successfully' };
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(40).toString('hex');
    const expiresInDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.prisma.userSession.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return token;
  }
}
