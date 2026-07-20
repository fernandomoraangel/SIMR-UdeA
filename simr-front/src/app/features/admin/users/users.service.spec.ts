import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { environment } from '@env/environment';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() extrae el array de data', () => {
    const wrapped = {
      success: true,
      message: 'ok',
      data: [{ id: '1', username: 'a', firstName: 'A', lastName: 'B', email: 'a@b.co', provider: 'local' }],
    };
    service.getAll().subscribe((res) => expect(res.length).toBe(1));
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(wrapped);
  });

  it('remove() envia DELETE por id', () => {
    service.remove('1').subscribe();
    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('updateRoles() envia PUT a /roles', () => {
    service.updateRoles('1', ['r1']).subscribe();
    const req = httpMock.expectOne(`${base}/1/roles`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ roles: ['r1'] });
    req.flush({ success: true });
  });

  it('create() usa el endpoint de signup', () => {
    service.create({ username: 'x', password: 'p', firstName: 'A', lastName: 'B', email: 'e@e.co', provider: 'local' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
