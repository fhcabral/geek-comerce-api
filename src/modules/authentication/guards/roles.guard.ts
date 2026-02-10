import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles/roles.decorator';
import { Role } from '../roles/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não tem @Roles, não restringe (passa)
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // JwtAuthGuard deveria garantir isso, mas vamos ser chatos mesmo assim
    if (!user?.role) throw new ForbiddenException('Perfil de acesso não encontrado.');

    const allowed = requiredRoles.includes(user.role);
    if (!allowed) throw new ForbiddenException('Você não tem permissão para acessar este recurso.');

    return true;
  }
}
