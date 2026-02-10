import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { Role } from './roles.enum';
import { RolesGuard } from '../guards/roles.guard';

export function OwnerOnly() {
  return applyDecorators(
    UseGuards(RolesGuard),
    Roles(Role.OWNER),
  );
}
