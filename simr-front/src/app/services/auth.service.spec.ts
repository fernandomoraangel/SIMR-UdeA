// import { TestBed } from '@angular/core/testing';
// import {
//   HttpClientTestingModule,
//   HttpTestingController,
// } from '@angular/common/http/testing';
// import { AuthService } from './auth.service';
// import { Router } from '@angular/router';
// import { environment } from '../../environments/environment';
// import { User } from '../interfaces/auth.interface';

// describe('AuthService', () => {
//   let service: AuthService;
//   let httpMock: HttpTestingController;
//   let routerSpy: jasmine.SpyObj<Router>;

//   const mockUser: User = {
//     _id: '123',
//     username: 'testuser',
//     email: 'test@example.com',
//     roles: ['user'],
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };

//   beforeEach(() => {
//     routerSpy = jasmine.createSpyObj('Router', ['navigate']);

//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [{ provide: Router, useValue: routerSpy }],
//     });

//     service = TestBed.inject(AuthService);
//     httpMock = TestBed.inject(HttpTestingController);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('should verify auth and update state on success', () => {
//     const response = {
//       success: true,
//       data: {
//         user: mockUser,
//         tokens: { expiresIn: 900 },
//       },
//     };

//     service.verifyAuth().subscribe((res) => {
//       expect(res.success).toBeTrue();
//       expect(service.isAuthenticated()).toBeTrue();
//       expect(service.getCurrentUser()).toEqual(mockUser);
//     });

//     const req = httpMock.expectOne(`${environment.base_url}/api/auth/verify`);
//     expect(req.request.method).toBe('GET');
//     expect(req.request.withCredentials).toBeTrue();
//     req.flush(response);
//   });

//   it('should clear state on verify auth failure', () => {
//     service.verifyAuth().subscribe({
//       next: () => fail('Should have errored'),
//       error: (err) => {
//         expect(service.isAuthenticated()).toBeFalse();
//         expect(service.getCurrentUser()).toBeNull();
//       },
//     });

//     const req = httpMock.expectOne(`${environment.base_url}/api/auth/verify`);
//     req.flush(
//       { message: 'Unauthorized' },
//       { status: 401, statusText: 'Unauthorized' }
//     );
//   });

//   it('should login and set state', () => {
//     const loginResponse = {
//       success: true,
//       data: {
//         user: mockUser,
//         tokens: {
//           expiresIn: 900,
//         },
//       },
//     };

//     service.login('testuser', 'password123').subscribe((res) => {
//       expect(res.success).toBeTrue();
//       expect(service.isAuthenticated()).toBeTrue();
//       expect(service.getCurrentUser()).toEqual(mockUser);
//     });

//     const req = httpMock.expectOne(`${environment.base_url}/api/auth/login`);
//     expect(req.request.method).toBe('POST');
//     expect(req.request.withCredentials).toBeTrue();
//     req.flush(loginResponse);
//   });

//   it('should call refresh token and reschedule on success', () => {
//     const refreshResponse = {
//       success: true,
//       data: {
//         tokens: {
//           expiresIn: 900,
//         },
//       },
//     };

//     // Preload current user to simulate logged-in state
//     (service as any).authStateSubject.next({
//       user: mockUser,
//       isAuthenticated: true,
//     });

//     service.refreshToken().subscribe((res) => {
//       expect(res.success).toBeTrue();
//       expect(service.isAuthenticated()).toBeTrue();
//     });

//     const req = httpMock.expectOne(`${environment.base_url}/api/auth/refresh`);
//     expect(req.request.method).toBe('POST');
//     req.flush(refreshResponse);
//   });

//   it('should logout, clear state, and navigate on success', () => {
//     service.logout().subscribe(() => {
//       expect(service.isAuthenticated()).toBeFalse();
//       expect(service.getCurrentUser()).toBeNull();
//       expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
//     });

//     const req = httpMock.expectOne(`${environment.base_url}/api/auth/logout`);
//     req.flush({});
//   });
// });
