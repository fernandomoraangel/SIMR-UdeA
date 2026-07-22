import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AuthorizationService } from '@core/services/authorization.service';
import { SweetAlertService } from '@core/services/sweet-alert.service';
import { AuthDialogService } from '@core/services/auth-dialog.service';
import { SoundWaveComponent } from '@shared/sound-wave/sound-wave.component';

interface MenuItem {
  label: string;
  ruta: string;
}

interface MenuGroup {
  label: string;
  ruta?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css'],
  standalone: false,
})
export class ShellComponent implements OnInit {
  isAuthenticated = false;
  currentUser: { fullName?: string } | null = null;

  // Menú definitivo: nombre corto de la entidad.
  // Migrados → ruta real; no migrados → /no-implementado/:modulo.
  grupos: MenuGroup[] = [
    {
      label: 'Obras',
      items: [
        { label: 'Obras', ruta: '/obras' },
        { label: 'Actores', ruta: '/actores' },
      ],
    },
    {
      label: 'Recursos',
      items: [
        { label: 'Recursos', ruta: '/recursos' },
        { label: 'Ejemplares', ruta: '/ejemplares' },
      ],
    },
    {
      label: 'Proyectos',
      items: [
        { label: 'Proyectos', ruta: '/proyectos' },
      ],
    },
    {
      label: 'Fondos',
      items: [
        { label: 'Fondos documentales', ruta: '/fondos' },
        { label: 'Colecciones', ruta: '/colecciones' },
      ],
    },
    {
      label: 'Términos',
      items: [
        { label: 'Materias', ruta: '/materias' },
        { label: 'Medios sonoros', ruta: '/medios' },
        { label: 'Sistemas sonoros', ruta: '/sistemas' },
        { label: 'Instrumentos', ruta: '/instrumentos' },
        { label: 'Géneros o Formas', ruta: '/generos' },
        { label: 'Géneros no musicales', ruta: '/generos-no-musicales' },
        { label: 'Idiomas', ruta: '/idiomas' },
        { label: 'Diccionario', ruta: '/diccionarios' },
        { label: 'Listas', ruta: '/listas' },
      ],
    },
    {
      label: 'Utilidades',
      items: [
        { label: 'Búsqueda General', ruta: '/search' },
        { label: 'Estadísticas', ruta: '/estadisticas' },
        { label: 'Grafo de Base de Datos', ruta: '/graph' },
      ],
    },
  ];

  adminGroup: MenuGroup = {
    label: 'Administración',
      items: [
        { label: 'Gestión de Usuarios', ruta: '/admin/usuarios' },
        { label: 'Gestión de Roles', ruta: '/admin/roles' },
        { label: 'Auditoría del Sistema', ruta: '/admin/auditoria' },
      ],
  };

  constructor(
    private authService: AuthService,
    private authorizationService: AuthorizationService,
    private sweetAlertService: SweetAlertService,
    private authDialogService: AuthDialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
      this.currentUser = state.user;
    });
  }

  /** El contenido de la ruta se oculta en la home pública (sin sesión) para
      dejar que la bienvenida del shell ocupe el espacio sin un bloque vacío. */
  get mostrarContenido(): boolean {
    return this.isAuthenticated || this.router.url !== '/';
  }

  /** Marca de agua centrada cuando el visitante está en la raíz ('/') y aún
      no ha seleccionado ningún módulo del menú (con o sin sesión). */
  get mostrarMarcaAgua(): boolean {
    return this.router.url === '/';
  }

  isAdmin(): boolean {
    return this.authorizationService.isAdmin();
  }

  abrirLogin(): void {
    this.authDialogService.open('login');
  }

  abrirRegistro(): void {
    this.authDialogService.open('signup');
  }

  logoutUser(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.sweetAlertService.showError(
          'Error al cerrar sesión',
          'No se pudo cerrar sesión. Por favor, inténtalo de nuevo.'
        );
      },
    });
  }

  acercaDe(): void {
    this.sweetAlertService.showInfoHtml(
      'SISTEMA DE INFORMACIÓN MUSICAS REGIONALES-SIMR<br />Versión: 1.0<br />Grupo de investigación Músicas Regionales<br />Universidad de Antioquia<br /> Conceptualización: Grupo de Investigación Músicas Regionales<br />Desarrollo: Fernando Mora Ángel<br />2022',
      'Acerca de',
      'assets/images/logomr.png'
    );
  }
}
