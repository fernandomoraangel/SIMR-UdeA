import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuditoriaService } from './auditoria.service';
import { environment } from '@env/environment';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/auditlogs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuditoriaService],
    });
    service = TestBed.inject(AuditoriaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() pasa filtros y devuelve logs+paginacion', () => {
    service.list({ action: 'role_created', limit: 10, skip: 0 }).subscribe((res) => {
      expect(res.logs.length).toBe(1);
      expect(res.pagination.total).toBe(1);
    });
    const req = httpMock.expectOne((r) => r.url === base && r.params.get('action') === 'role_created');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ success: true, data: { logs: [{ _id: '1', action: 'role_created' }], pagination: { total: 1, limit: 10, skip: 0, hasMore: false } } });
  });

  it('list() sin filtros usa limite por defecto', () => {
    service.list().subscribe((res) => expect(res.logs.length).toBe(0));
    const req = httpMock.expectOne((r) => r.params.get('action') === null && r.params.get('limit') === '50');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { logs: [], pagination: { total: 0, limit: 50, skip: 0, hasMore: false } } });
  });
});
