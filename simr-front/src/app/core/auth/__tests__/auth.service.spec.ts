import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    fullName: 'Test User',
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be unauthenticated initially', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should login and expose authenticated state', () => {
    const loginResponse = {
      success: true,
      data: { user: mockUser, tokenInfo: { expiresIn: 900 } },
    };

    service.login('testuser', 'password123').subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getCurrentUser()?.id).toEqual('123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(loginResponse);
  });

  it('should verify auth and update state on success', () => {
    const response = {
      success: true,
      data: { user: mockUser, tokenInfo: { expiresIn: 900 } },
    };

    service.verifyAuth().subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(service.isAuthenticated()).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/verify`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(response);
  });
});
