import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ListasService } from './listas.service';
import { environment } from '@env/environment';

describe('ListasService', () => {
  let service: ListasService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/listas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ListasService],
    });
    service = TestBed.inject(ListasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() devuelve un array plano de listas', () => {
    const mock = [
      { nombre_lista: 'tipos', elementos: ['Libro'], _id: '1' },
      { nombre_lista: 'roles', elementos: ['admin'], _id: '2' },
    ];
    service.list().subscribe((res) => {
      expect(res.length).toBe(2);
      expect(res[0].nombre_lista).toBe('tipos');
    });
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mock);
  });

  it('addElement() envia POST a /elementos y devuelve data', () => {
    const updated = { nombre_lista: 'tipos', elementos: ['Libro', 'Mapa'], _id: '1' };
    service.addElement('tipos', { elemento: 'Mapa' }).subscribe((res) => {
      expect(res.elementos).toContain('Mapa');
    });
    const req = httpMock.expectOne(`${base}/tipos/elementos`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: updated });
  });

  it('deleteElement() envia DELETE por indice', () => {
    const updated = { nombre_lista: 'tipos', elementos: ['Libro'], _id: '1' };
    service.deleteElement('1', 1).subscribe((res) => {
      expect(res.elementos.length).toBe(1);
    });
    const req = httpMock.expectOne(`${base}/1/elementos/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: updated });
  });

  it('remove() envia DELETE por id', () => {
    service.remove('1').subscribe();
    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('propaga el mensaje de error del backend', () => {
    service.list().subscribe({
      error: (err) => expect(err).toContain('fallo'),
    });
    const req = httpMock.expectOne(base);
    req.flush({ message: 'fallo' }, { status: 500, statusText: 'Server Error' });
  });
});
