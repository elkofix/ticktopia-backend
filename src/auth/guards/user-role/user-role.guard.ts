import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const validRoles: ValidRoles[] = this.reflector.get(
      'roles',
      context.getHandler(),
    ) || [];

    if (validRoles.length === 0) return true;

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) return false;

    return validRoles.some((role) => user.roles.includes(role));
  }
}