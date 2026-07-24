import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AuthorizationService } from '@core/services/authorization.service';
import { SweetAlertService } from '@core/services/sweet-alert.service';
import { AuthDialogService } from '@core/services/auth-dialog.service';
import { SoundWaveComponent } from '@shared/sound-wave/sound-wave.component';
import { SesionTrackerService } from '@features/estadisticas-uso/data/sesion-tracker.service';

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
  private readonly sesionTracker = inject(SesionTrackerService);

  // Menú definitivo: organizado por categorías funcionales.
  // Migrados → ruta real; no migrados → /no-implementado/:modulo.
  grupos: MenuGroup[] = [
    {
      label: 'Catalogación',
      items: [
        { label: 'Obras', ruta: '/obras' },
        { label: 'Actores', ruta: '/actores' },
        { label: 'Recursos', ruta: '/recursos' },
        { label: 'Ejemplares', ruta: '/ejemplares' },
        { label: 'Proyectos', ruta: '/proyectos' },
        { label: 'Fondos documentales', ruta: '/fondos' },
        { label: 'Colecciones', ruta: '/colecciones' },
      ],
    },
    {
      label: 'Catálogo público',
      items: [
        { label: 'Obras', ruta: '/opac/obras' },
        { label: 'Actores', ruta: '/opac/actores' },
        { label: 'Fondos y Colecciones', ruta: '/opac/fondos' },
        { label: 'Roles', ruta: '/opac/roles' },
        { label: 'Instrumentos', ruta: '/opac/instrumentos' },
        { label: 'Géneros', ruta: '/opac/generos' },
      ],
    },
    {
      label: 'Vocabularios controlados',
      items: [
        { label: 'Materias', ruta: '/materias' },
        { label: 'Medios sonoros', ruta: '/medios' },
        { label: 'Sistemas sonoros', ruta: '/sistemas' },
        { label: 'Instrumentos', ruta: '/instrumentos' },
        { label: 'Géneros o formas', ruta: '/generos' },
        { label: 'Géneros no musicales', ruta: '/generos-no-musicales' },
        { label: 'Idiomas', ruta: '/idiomas' },
        { label: 'Diccionario', ruta: '/diccionarios' },
        { label: 'Listas', ruta: '/listas' },
      ],
    },
    {
      label: 'Visualización de datos',
      items: [
        { label: 'Grafo de base de datos', ruta: '/graph' },
        { label: 'Mapa visualizador', ruta: '/mapa-visualizador' },
        { label: 'Línea de tiempo', ruta: '/linea-tiempo' },
        { label: 'Estadísticas', ruta: '/estadisticas' },
      ],
    },
    {
      label: 'Utilidades',
      items: [
        { label: 'Búsqueda general', ruta: '/search' },
        { label: 'Nube de archivos', ruta: '/nube-archivos' },
        { label: 'Estadísticas de uso', ruta: '/estadisticas-uso' },
        { label: 'Soporte técnico', ruta: '/soporte' },
      ],
    },
  ];

  adminGroup: MenuGroup = {
    label: 'Administración',
      items: [
        { label: 'Gestión de Usuarios', ruta: '/admin/usuarios' },
        { label: 'Gestión de Roles', ruta: '/admin/roles' },
        { label: 'Auditoría del Sistema', ruta: '/admin/auditoria' },
        { label: 'Nube de Archivos', ruta: '/admin/nube-config' },
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
