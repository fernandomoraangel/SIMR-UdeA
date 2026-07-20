import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ShellComponent } from '../shell.component';
import { AuthService } from '../../auth/auth.service';
import { AuthorizationService } from '../../services/authorization.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { AuthDialogService } from '../../services/auth-dialog.service';

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShellComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
      ],
      providers: [AuthService, AuthorizationService, SweetAlertService, AuthDialogService],
      schemas: [NO_ERRORS_SCHEMA],
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
  });
});
