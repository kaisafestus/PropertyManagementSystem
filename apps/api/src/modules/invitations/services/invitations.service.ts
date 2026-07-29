import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole, InvitationStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../../database/prisma/prisma.service';
import { PasswordService } from '../../../common/services/password.service';
import { AuditService } from '../../../common/services/audit.service';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    dto: CreateInvitationDto,
    organizationId: string,
    invitedById: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingInvitation = await this.prisma.invitation.findUnique({
      where: {
        email_organizationId: {
          email: dto.email,
          organizationId,
        },
      },
    });

    if (
      existingInvitation &&
      existingInvitation.status === InvitationStatus.PENDING
    ) {
      throw new ConflictException(
        'An active invitation already exists for this email',
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId,
        email: dto.email,
        role: dto.role,
        token,
        invitedById,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        expiresAt,
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await this.auditService.log({
      userId: invitedById,
      action: 'INVITATION_SENT',
      entity: 'Invitation',
      entityId: invitation.id,
      metadata: { email: dto.email, role: dto.role },
    });

    return invitation;
  }

  async findAll(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId },
      include: {
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been used');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('This invitation has expired');
    }

    if (invitation.organization.status === 'SUSPENDED') {
      throw new UnauthorizedException('This organization is suspended');
    }

    return invitation;
  }

  async accept(dto: AcceptInvitationDto) {
    const invitation = await this.findByToken(dto.token);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException('An account already exists for this email');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          organizationId: invitation.organizationId,
          email: invitation.email,
          firstName: invitation.firstName || '',
          lastName: invitation.lastName || '',
          phone: invitation.phone,
          passwordHash: hashedPassword,
          emailVerified: true,
          status: 'ACTIVE',
          role: invitation.role,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      if (invitation.role === UserRole.TENANT) {
        await tx.tenant.create({
          data: { userId: newUser.id },
        });
      } else if (invitation.role === UserRole.VENDOR) {
        await tx.vendor.create({
          data: {
            userId: newUser.id,
            companyName: 'Pending Company Name',
          },
        });
      }

      return newUser;
    });

    await this.auditService.log({
      userId: user.id,
      action: 'INVITATION_ACCEPTED',
      entity: 'Invitation',
      entityId: invitation.id,
      metadata: { email: invitation.email, role: invitation.role },
    });

    const { passwordHash, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async revoke(id: string, organizationId: string, userId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Can only revoke pending invitations');
    }

    const updated = await this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    });

    await this.auditService.log({
      userId,
      action: 'INVITATION_REVOKED',
      entity: 'Invitation',
      entityId: id,
      metadata: { email: invitation.email },
    });

    return updated;
  }

  async remove(id: string, organizationId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundException('Invitation not found');
    }

    return this.prisma.invitation.delete({ where: { id } });
  }
}
