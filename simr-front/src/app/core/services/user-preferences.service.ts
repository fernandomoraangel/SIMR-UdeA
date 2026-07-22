import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/users/preferences`;

  getPreferences(key?: string): Observable<any> {
    return this.http.get<{ success: boolean; data: any }>(this.API_URL, { withCredentials: true }).pipe(
      map((res) => res?.data || {}),
      map((prefs) => (key ? prefs[key] ?? {} : prefs)),
      catchError(() => of(key ? {} : {}))
    );
  }

  updatePreferences(updates: Record<string, any>): Observable<any> {
    return this.http.put<{ success: boolean; data: any }>(this.API_URL, updates, { withCredentials: true }).pipe(
      map((res) => res?.data || {}),
      catchError(() => of({}))
    );
  }
}
