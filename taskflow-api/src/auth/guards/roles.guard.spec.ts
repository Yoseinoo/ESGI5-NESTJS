import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/interfaces/user.interface';

const createMockContext = (role: string): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 'uuid', email: 'test@test.com', role } }),
    }),
  }) as any;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('autorise si aucun rôle requis (pas de @Roles)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const ctx = createMockContext(UserRole.VIEWER);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('autorise si le rôle correspond', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext(UserRole.ADMIN);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('refuse si le rôle est insuffisant', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const ctx = createMockContext(UserRole.VIEWER);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("autorise si plusieurs rôles acceptés et l'un correspond", () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN, UserRole.MEMBER]);
    const ctx = createMockContext(UserRole.MEMBER);

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
