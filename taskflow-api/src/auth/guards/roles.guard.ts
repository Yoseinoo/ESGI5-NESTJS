import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // clé définie dans ton décorateur @Roles
import { UserRole } from '../../users/interfaces/user.interface'; // ou l'entité UserRole

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Lire les rôles requis depuis les métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2️⃣ Si aucun rôle requis, laisser passer
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3️⃣ Récupérer l'utilisateur depuis la requête
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // pas d'utilisateur → accès refusé
    }

    // 4️⃣ Vérifier que le rôle de l'utilisateur figure dans les rôles requis
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `User role "${user.role}" is not authorized to access this resource`,
      );
    }

    return true;
  }
}