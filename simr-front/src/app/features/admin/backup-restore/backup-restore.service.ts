import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";

export interface EntityInfo {
  name: string;
  collection: string;
  count: number;
  fields: number;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  exportedBy: string;
  counts: Record<string, number>;
  data: Record<string, any[]>;
}

export interface RestorePreview {
  name: string;
  incomingCount: number;
  currentCount: number;
  willDrop: boolean;
}

export interface RestoreResult {
  name: string;
  status: "success" | "error" | "skipped";
  message: string;
  dropped?: boolean;
  count?: number;
}

@Injectable({ providedIn: "root" })
export class BackupRestoreService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/backup`;

  listEntities(): Observable<{ success: boolean; data: EntityInfo[] }> {
    return this.http.get<{ success: boolean; data: EntityInfo[] }>(`${this.API}/entities`);
  }

  exportBackup(entities: string[]): Observable<{ success: boolean; data: BackupData }> {
    return this.http.post<{ success: boolean; data: BackupData }>(`${this.API}/export`, { entities });
  }

  restorePreview(backup: BackupData): Observable<{ success: boolean; data: RestorePreview[] }> {
    return this.http.post<{ success: boolean; data: RestorePreview[] }>(`${this.API}/restore-preview`, { backup });
  }

  restoreBackup(backup: BackupData, entities: string[]): Observable<{ success: boolean; data: RestoreResult[] }> {
    return this.http.post<{ success: boolean; data: RestoreResult[] }>(`${this.API}/restore`, { backup, entities });
  }
}
