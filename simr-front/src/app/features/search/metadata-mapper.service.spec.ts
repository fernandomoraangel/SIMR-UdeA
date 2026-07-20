import { TestBed } from '@angular/core/testing';
import { MetadataMapperService } from './metadata-mapper.service';

describe('MetadataMapperService', () => {
  let service: MetadataMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetadataMapperService);
  });

  it('mapea a formato SIMR con field y value', () => {
    const out = service.toSIMR({ titulo: 'Mapa', descripcion: 'x' });
    expect(out.length).toBe(2);
    expect(out[0].value).toBe('Mapa');
    expect(out[0].field).toBeDefined();
  });

  it('mapea a MARC21 usando el mapping de titulo', () => {
    const out = service.toMARC21({ titulo: 'Mapa', isbn: '123' });
    const titulo = out.find((f) => f.tag === '245');
    expect(titulo).toBeDefined();
    expect(titulo?.subfield).toBe('a');
    expect(titulo?.value).toBe('Mapa');
  });

  it('mapea a Dublin Core con prefijo dc:', () => {
    const out = service.toDublinCore({ titulo: 'Mapa', descripcion: 'x' });
    expect(out[0].element).toContain('dc:');
    expect(out.find((f) => f.element === 'dc:title')?.value).toBe('Mapa');
  });

  it('lista formatos disponibles', () => {
    const formats = service.getAvailableFormats();
    expect(formats.map((f) => f.value)).toContain('marc21');
    expect(formats.map((f) => f.value)).toContain('dublincore');
  });

  it('excluye campos internos en SIMR', () => {
    const out = service.toSIMR({ titulo: 'Mapa', _id: 'abc', creado: '2024' });
    expect(out.find((f) => f.field === '_id')).toBeUndefined();
    expect(out.find((f) => f.field === 'creado')).toBeUndefined();
  });
});
