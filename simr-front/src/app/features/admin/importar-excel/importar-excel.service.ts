import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";

export interface EntityField {
  name: string;
  label: string;
  type: string;
  main: boolean;
}

export interface EntityInfo {
  name: string;
  label: string;
  fields: EntityField[];
}

export interface AutoMapSuggestion {
  entity: string;
  field: string;
  confidence: number;
}

export interface ColumnAutoMap {
  columnIndex: number;
  columnName: string;
  suggestions: AutoMapSuggestion[];
  bestMatch: AutoMapSuggestion | null;
}

export interface PreviewResponse {
  columns: string[];
  totalRows: number;
  previewRows: string[][];
  autoMap: ColumnAutoMap[];
  sheetName: string;
  entities: EntityInfo[];
}

export interface ColumnMapping {
  columnIndex: number;
  columnName: string;
  entity: string | null;
  field: string | null;
  confidence: number;
  ignore: boolean;
  asDescriptor: boolean;
  descriptorKey: string;
}

export interface RowValidation {
  rowIndex: number;
  data: string[];
  matchFound: boolean;
  matchId: string | null;
  matchTitle: string | null;
  matchConfidence: number;
  suggestedAction: "create" | "update" | "skip";
  selected: boolean;
}

export interface RowAction {
  rowIndex: number;
  rowAction: "create" | "update" | "skip";
  matchId: string | null;
}

export interface ImportResult {
  rowIndex: number;
  status: "success" | "warning" | "error" | "skipped";
  message: string;
  docId?: string;
}

export interface ImportSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  total: number;
}

export interface ExecuteResponse {
  results: ImportResult[];
  summary: ImportSummary;
}

@Injectable({ providedIn: "root" })
export class ImportarExcelService {
  private readonly http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/import`;

  preview(file: File): Observable<{ success: boolean; data: PreviewResponse }> {
    const fd = new FormData();
    fd.append("file", file);
    return this.http.post<{ success: boolean; data: PreviewResponse }>(`${this.API}/preview`, fd);
  }

  dedup(payload: { columns: string[]; rows: string[][]; mappings: ColumnMapping[] }): Observable<{ success: boolean; data: RowValidation[] }> {
    return this.http.post<{ success: boolean; data: RowValidation[] }>(`${this.API}/dedup`, payload);
  }

  execute(payload: { columns: string[]; rows: string[][]; mappings: ColumnMapping[]; actions: RowAction[] }): Observable<{ success: boolean; data: ExecuteResponse }> {
    return this.http.post<{ success: boolean; data: ExecuteResponse }>(`${this.API}/execute`, payload);
  }
}
