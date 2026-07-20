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

  // Módulos ya migrados a Angular (rutas reales). El resto va a /no-implementado.
  // Todas las rutas "no implementado" usan UN solo segmento para que la ruta
  // `no-implementado/:modulo` las capture sin 404.
  grupos: MenuGroup[] = [
    {
      label: 'Obras',
      items: [
        { label: 'Crear obra', ruta: '/no-implementado/obras-crear' },
        { label: 'Listar obras', ruta: '/no-implementado/obras' },
        { label: 'Crear actor', ruta: '/no-implementado/actores-crear' },
        { label: 'Listar actores', ruta: '/no-implementado/actores' },
      ],
    },
    {
      label: 'Recursos',
      items: [
        { label: 'Crear Recurso', ruta: '/no-implementado/recursos-crear' },
        { label: 'Listar Recursos', ruta: '/no-implementado/recursos' },
        { label: 'Crear Ejemplar', ruta: '/no-implementado/ejemplares-crear' },
        { label: 'Listar Ejemplares', ruta: '/no-implementado/ejemplares' },
      ],
    },
    {
      label: 'Proyectos',
      items: [
        { label: 'Crear Proyecto', ruta: '/no-implementado/proyectos-crear' },
        { label: 'Listar Proyectos', ruta: '/no-implementado/proyectos' },
      ],
    },
    {
      label: 'Fondos',
      items: [
        { label: 'Crear Fondo documental', ruta: '/no-implementado/fondos-crear' },
        { label: 'Listar Fondos documentales', ruta: '/no-implementado/fondos' },
        { label: 'Crear Colección', ruta: '/no-implementado/colecciones-crear' },
        { label: 'Listar Colecciones', ruta: '/no-implementado/colecciones' },
      ],
    },
    {
      label: 'Términos',
      items: [
        { label: 'Crear Instrumento', ruta: '/no-implementado/instrumentos-crear' },
        { label: 'Listar Instrumentos', ruta: '/no-implementado/instrumentos' },
        { label: 'Crear Medio sonoro', ruta: '/no-implementado/medios-crear' },
        { label: 'Listar Medios sonoros', ruta: '/no-implementado/medios' },
        { label: 'Crear Sistema sonoro', ruta: '/no-implementado/sistemas-crear' },
        { label: 'Listar Sistemas sonoros', ruta: '/no-implementado/sistemas' },
        { label: 'Crear Materia', ruta: '/no-implementado/materias-crear' },
        { label: 'Listar Materias', ruta: '/no-implementado/materias' },
        { label: 'Crear Género o Forma', ruta: '/no-implementado/generos-crear' },
        { label: 'Listar Géneros o Formas', ruta: '/no-implementado/generos' },
        { label: 'Crear Género o Forma no musical', ruta: '/no-implementado/generosnomusicales-crear' },
        { label: 'Listar Géneros o Formas no musicales', ruta: '/no-implementado/generosnomusicales' },
        { label: 'Crear idioma', ruta: '/idiomas/create' },
        { label: 'Listar idiomas', ruta: '/idiomas' },
        { label: 'Crear campo en diccionario', ruta: '/diccionarios/create' },
        { label: 'Listar Diccionario de datos', ruta: '/diccionarios' },
        { label: 'Gestión de Listas', ruta: '/listas' },
      ],
    },
    {
      label: 'Utilidades',
      items: [
        { label: 'Búsqueda General', ruta: '/search' },
        { label: 'Grafo de Base de Datos', ruta: '/no-implementado/graph' },
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
