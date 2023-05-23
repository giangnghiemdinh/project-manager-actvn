import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../features/user/models';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<string | string[]>(
      'role',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    const user = <UserEntity>request.user;
    if (!role) {
      return true;
    }
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }
}
