import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ListasAdminComponent } from './listas-admin.component';
import { ListasService, Lista } from '../listas.service';
import { AuthorizationService } from '@core/services/authorization.service';

const listasMock: Lista[] = [
  {
    _id: '1',
    nombre_lista: 'tipos',
    elementos: ['Libro', 'Mapa'],
    fecha_modificacion: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    nombre_lista: 'nNormalizados',
    elementos: ['DOI'],
    metadata: [{ sigla: 'DOI', frase: 'Digital Object Identifier' }],
  },
];

class ListasServiceStub {
  list() {
    return of(listasMock);
  }
  addElement() {
    return of({ ...listasMock[0] });
  }
  updateElement() {
    return of({ ...listasMock[0] });
  }
  deleteElement() {
    return of({ ...listasMock[0] });
  }
  remove() {
    return of({});
  }
}

class AuthzStub {
  hasAnyRole() {
    return true;
  }
  requireAuth() {
    return true;
  }
}

const snackStub = { open: () => ({}) };
const dialogStub = { open: () => ({ afterClosed: () => of(true) }) };

describe('ListasAdminComponent', () => {
  let component: ListasAdminComponent;
  let fixture: ComponentFixture<ListasAdminComponent>;
  let serviceStub: ListasServiceStub;

  beforeEach(async () => {
    serviceStub = new ListasServiceStub();
    await TestBed.configureTestingModule({
      imports: [ListasAdminComponent],
      providers: [
        { provide: ListasService, useValue: serviceStub },
        { provide: AuthorizationService, useClass: AuthzStub },
        { provide: MatSnackBar, useValue: snackStub },
        { provide: MatDialog, useValue: dialogStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListasAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('carga y ordena las listas', () => {
    expect(component.listas.length).toBe(2);
    expect(component.listas[0].nombre_lista).toBe('nNormalizados');
  });

  it('selecciona una lista', () => {
    component.select(component.listas[0]);
    expect(component.selected?.nombre_lista).toBe('nNormalizados');
    expect(component.isNNormalizados).toBeTrue();
  });

  it('filtra listas por nombre', () => {
    component.filtro = 'tipo';
    expect(component.filteredListas.length).toBe(1);
    expect(component.filteredListas[0].nombre_lista).toBe('tipos');
  });

  it('canWrite es true para admin/bibliotecologo', () => {
    expect(component.canWrite).toBeTrue();
  });

  it('maneja error de carga', () => {
    spyOn(serviceStub, 'list').and.returnValue(throwError(() => 'Error de red'));
    component.load();
    expect(component.error).toBe('Error de red');
  });
});
