import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SearchService } from './search.service';
import { environment } from '@env/environment';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/search`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService],
    });
    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('search() envia q y parámetros de paginación', () => {
    service.search('mapa', { limit: 20, skip: 0 }).subscribe((res) => {
      expect(res.results.length).toBe(1);
    });
    const req = httpMock.expectOne(
      (r) => r.url === base && r.params.get('q') === 'mapa' && r.params.get('limit') === '20'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, results: [{ _id: '1', _entityType: 'Obra', _searchScore: 1 }], total: 1 });
  });

  it('search() incluye entities como CSV', () => {
    service.search('x', { entities: ['Obra', 'Actor'] }).subscribe();
    const req = httpMock.expectOne((r) => r.params.get('entities') === 'Obra,Actor');
    req.flush({ success: true, results: [], total: 0 });
  });

  it('getMetadata() es público (sin withCredentials forzado)', () => {
    service.getMetadata().subscribe((res) => {
      expect(res.entities.length).toBeGreaterThan(0);
    });
    const req = httpMock.expectOne(`${base}/metadata`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, entities: ['Obra', 'Actor'], metadata: {}, operators: [], examples: [] });
  });

  it('propaga mensaje de error', () => {
    service.search('x').subscribe({
      error: (err) => expect(err).toContain('fallo'),
    });
    const req = httpMock.expectOne((r) => r.url === base);
    req.flush({ message: 'fallo' }, { status: 500, statusText: 'Server Error' });
  });
});
