import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('=== ROLES GUARD ===');
    console.log('Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    console.log('Request user:', request.user);

    if (!request.user) {
      console.log('No user found in request');
      return false;
    }

    const hasRole = requiredRoles.includes(request.user.role);
    console.log('User role:', request.user.role);
    console.log('Has role:', hasRole);

    return hasRole;
  }
}
