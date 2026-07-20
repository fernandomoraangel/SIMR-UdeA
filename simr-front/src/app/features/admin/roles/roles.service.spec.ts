import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RolesService } from './roles.service';
import { environment } from '@env/environment';

describe('RolesService', () => {
  let service: RolesService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/roles`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RolesService],
    });
    service = TestBed.inject(RolesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() extrae el array de data', () => {
    service.getAll().subscribe((res) => expect(res.length).toBe(1));
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ id: '1', name: 'admin' }] });
  });

  it('getResources() mapea a array de keys', () => {
    service.getResources().subscribe((res) => {
      expect(res.length).toBe(2);
      expect(res[0]).toBe('user');
    });
    const req = httpMock.expectOne(`${base}/resources`);
    req.flush({ success: true, data: [{ key: 'user', name: 'Usuarios' }, { key: 'role', name: 'Roles' }] });
  });

  it('update() envia PUT por id', () => {
    service.update('1', { name: 'x' }).subscribe();
    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true });
  });

  it('remove() envia DELETE por id', () => {
    service.remove('1').subscribe();
    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
