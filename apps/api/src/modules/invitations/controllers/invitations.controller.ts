import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

import { InvitationsService } from '../services/invitations.service';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';

@ApiTags('Invitations')
@Controller({ path: 'invitations', version: '1' })
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Create a new invitation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invitation created successfully',
  })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(dto, organizationId, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'List all invitations for the organization' })
  findAll(@CurrentUser('organizationId') organizationId: string) {
    return this.invitationsService.findAll(organizationId);
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Validate invitation token (public endpoint)' })
  findByToken(@Param('token') token: string) {
    return this.invitationsService.findByToken(token);
  }

  @Post('accept')
  @ApiOperation({
    summary: 'Accept invitation and create account (public endpoint)',
  })
  @ApiOkResponse({
    description: 'Account created successfully',
  })
  accept(@Body() dto: AcceptInvitationDto) {
    return this.invitationsService.accept(dto);
  }

  @Post(':id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  revoke(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invitationsService.revoke(id, organizationId, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Delete an invitation' })
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.invitationsService.remove(id, organizationId);
  }
}
