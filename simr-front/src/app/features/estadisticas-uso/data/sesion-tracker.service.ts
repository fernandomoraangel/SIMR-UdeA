import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { firstValueFrom, Subscription, filter } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class SesionTrackerService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/usos`;

  private sesionId: string | null = null;
  private currentModule: string | null = null;
  private authSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;
  private starting = false;

  constructor() {
    this.init();
  }

  private init(): void {
    this.authService.ready$.subscribe(() => {
      const user = this.authService.getCurrentUser();
      if (user?.id) {
        this.iniciarSesion();
      }
    });

    this.authSubscription = this.authService.authState$.subscribe((state) => {
      if (state.isAuthenticated && state.user?.id && !this.sesionId && !this.starting) {
        this.iniciarSesion();
      }
      if (!state.isAuthenticated && this.sesionId) {
        this.cerrarSesion();
      }
    });

    this.routerSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        this.handleNavigation(event.urlAfterRedirects);
      });
  }

  private handleNavigation(url: string): void {
    const module = this.extractModule(url);
    if (module && module !== this.currentModule) {
      if (this.sesionId) {
        this.cerrarSesion();
      }
      this.iniciarSesion(module);
    }
  }

  private extractModule(url: string): string | null {
    const segment = url.split('?')[0].split('#')[0].split('/').filter(Boolean)[0];
    return segment ?? null;
  }

  async iniciarSesion(modulo?: string): Promise<string | null> {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return null;

    this.starting = true;
    const moduleName = modulo ?? this.extractModule(this.router.url) ?? 'general';
    this.currentModule = moduleName;

    try {
      const ip = await this.obtenerIp();
      const userAgent = navigator.userAgent;

      const res = await firstValueFrom(
        this.http.post<{ success: boolean; data: { _id: string } }>(
          this.API_URL,
          { usuario: user.id, modulo: moduleName, ip, userAgent }
        )
      );
      this.sesionId = res.data._id;
      return this.sesionId;
    } catch {
      this.sesionId = null;
      return null;
    } finally {
      this.starting = false;
    }
  }

  async cerrarSesion(): Promise<void> {
    const id = this.sesionId;
    this.sesionId = null;
    this.currentModule = null;
    if (!id) return;
    try {
      await firstValueFrom(this.http.put(`${this.API_URL}/${id}/cerrar`, {}));
    } catch {
      // silently ignore
    }
  }

  async registrarAccion(
    entidad: string,
    tipoAccion: 'create' | 'edit' | 'delete' | 'view',
    entidadId?: string
  ): Promise<void> {
    if (!this.sesionId) return;
    try {
      await firstValueFrom(
        this.http.post(`${this.API_URL}/accion`, {
          sesionId: this.sesionId,
          entidad,
          tipoAccion,
          entidadId,
        })
      );
    } catch {
      // silently ignore
    }
  }

  private async obtenerIp(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      return data.ip ?? '0.0.0.0';
    } catch {
      return '0.0.0.0';
    }
  }
}
