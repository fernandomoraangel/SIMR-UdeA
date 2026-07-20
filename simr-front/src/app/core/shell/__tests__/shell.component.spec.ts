import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ShellComponent } from '../shell.component';
import { AuthService } from '../../auth/auth.service';
import { AuthorizationService } from '../../services/authorization.service';
import { SweetAlertService } from '../../services/sweet-alert.service';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShellComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService, AuthorizationService, SweetAlertService],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('muestra menú cuando hay sesión', () => {
    (authService as any).authStateSubject.next({
      user: {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.co',
        username: 'ab',
        provider: 'local',
        roles: [{ name: 'catalogador' }],
        fullName: 'A B',
      },
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
    });
    fixture.detectChanges();
    expect(component.isAuthenticated).toBeTrue();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.navbar')).toBeTruthy();
    expect(el.querySelector('.navbar-nav')).toBeTruthy();
  });

  it('oculta menús y muestra bienvenida sin sesión', () => {
    (authService as any).authStateSubject.next({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });
    fixture.detectChanges();
    expect(component.isAuthenticated).toBeFalse();
    const el: HTMLElement = fixture.nativeElement;
    // El <ul> existe pero sin sesión no hay dropdowns de módulos (los de la
    // izquierda llevan *ngIf="isAuthenticated"); el dropdown de usuario a la
    // derecha sí permanece (muestra Iniciar sesión/Registrarse)
    expect(el.querySelector('.navbar-nav:not(.navbar-right) .dropdown')).toBeFalsy();
    expect(el.textContent).toContain('Bienvenido a nuestro Sistema de Información');
  });

  it('canCreate delega en AuthorizationService', () => {
    const auth = TestBed.inject(AuthorizationService);
    spyOn(auth, 'canCreate').and.returnValue(true);
    expect(component.canCreate()).toBeTrue();
    expect(auth.canCreate).toHaveBeenCalled();
  });
});
