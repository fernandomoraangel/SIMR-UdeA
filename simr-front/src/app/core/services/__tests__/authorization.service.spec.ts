import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthorizationService } from '../authorization.service';
import { AuthService } from '../../auth/auth.service';
import { User, Role } from '../../models/user.model';
import { environment } from '@env/environment';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  const adminRole: Role = { name: 'admin' };
  const catalogadorRole: Role = { name: 'catalogador' };
  const lectorRole: Role = { name: 'lector' };
  const investigadorRole: Role = { name: 'investigador' };

  function setUser(roles: (Role | string)[] | null): void {
    const user: User = {
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.co',
      username: 'ab',
      provider: 'local',
      roles: roles ?? undefined,
    };
    (authService as any).authStateSubject.next({
      user,
      isAuthenticated: !!roles,
      isInitialized: true,
      isLoading: false,
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthorizationService, AuthService],
    });
    service = TestBed.inject(AuthorizationService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    service.getPermissions();
  });

  it('isAdmin true solo cuando hay rol admin', () => {
    setUser([catalogadorRole]);
    expect(service.isAdmin()).toBeFalse();
    setUser([adminRole]);
    expect(service.isAdmin()).toBeTrue();
  });

  it('canCreate: admin y catalogador pueden, lector/investigador no', () => {
    setUser([adminRole]);
    expect(service.canCreate()).toBeTrue();
    setUser([catalogadorRole]);
    expect(service.canCreate()).toBeTrue();
    setUser([lectorRole]);
    expect(service.canCreate()).toBeFalse();
    setUser([investigadorRole]);
    expect(service.canCreate()).toBeFalse();
  });

  it('canCreate false si no hay usuario', () => {
    setUser(null);
    expect(service.canCreate()).toBeFalse();
  });

  it('isOnlyRole detecta rol único sin jerarquía mayor', () => {
    setUser([lectorRole]);
    expect(service.isOnlyRole('lector')).toBeTrue();
    setUser([lectorRole, adminRole]);
    expect(service.isOnlyRole('lector')).toBeFalse();
  });

  it('canList requiere autenticación', () => {
    setUser(null);
    expect(service.canList()).toBeFalse();
    setUser([lectorRole]);
    expect(service.canList()).toBeTrue();
  });

  it('loadPermissions mapea respuesta del backend', () => {
    setUser([adminRole]);
    let result: any = null;
    service.loadPermissions().subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${environment.apiUrl}/permissions`);
    expect(req.request.withCredentials).toBeTrue();
    req.flush({
      data: {
        permissions: { obras: { create: 'any', read: 'any' } },
        role: adminRole,
      },
    });
    expect(result.permissions['obras'].create).toBe('any');
    expect(service.hasPermission('obras', 'create')).toBeTrue();
    expect(service.hasPermission('obras', 'delete')).toBeFalse();
  });
});
