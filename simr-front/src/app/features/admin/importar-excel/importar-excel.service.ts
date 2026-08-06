import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env/environment";

export interface CompoundRefSubMapping {
  columnIndex: number;
  subField: string;
  constantValue?: string | null;
}

export interface CompoundRefGroup {
  id: string;
  entityName: string;
  refField: string;
  subMappings: CompoundRefSubMapping[];
  refRol?: string | null;
}

export interface CompoundObjectGroup {
  id: string;
  entityName: string;
  field: string;
  subMappings: { subField: string; columnIndex: number; constantValue?: string | null }[];
}

export interface EntitySubField {
  name: string;
  label: string;
  entryField?: boolean;
  refEntity?: string | null;
  list?: string | null;
}

export interface CompanionField {
  name: string;
  label: string;
  type?: "number" | "string";
  list?: string | null;
}

export interface CompanionValue {
  name: string;
  columnIndex: number | null;
  constantValue?: string | null;
}

export interface EntityField {
  name: string;
  label: string;
  type: string;
  main: boolean;
  list?: string | null;
  isRef: boolean;
  isCompoundObject?: boolean;
  refEntity: string | null;
  refDisplayLabel: string | null;
  subFields?: EntitySubField[] | null;
  companionFields?: CompanionField[] | null;
}

export interface EntityRefInfo {
  field: string;
  refEntity: string;
  searchField: string;
  displayLabel: string;
  single: boolean;
}

export interface EntityInfo {
  name: string;
  label: string;
  order?: number;
  fields: EntityField[];
  refs: EntityRefInfo[];
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
  rows: string[][];
  autoMap: ColumnAutoMap[];
  sheetName: string;
  entities: EntityInfo[];
  columnExamples: string[][];
}

export interface ColumnMapping {
  columnIndex: number;
  columnName: string;
  entity: string | null;
  field: string | null;
  subField?: string | null;
  confidence: number;
  ignore: boolean;
  asDescriptor: boolean;
  descriptorKey: string;
  refAction?: "use_existing" | "create" | null;
  refMatchId?: string | null;
  refMatchLabel?: string | null;
  refRol?: string | null;
  delimiter?: string | null;
  constantValue?: string | null;
  companionValues?: CompanionValue[];
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

export interface RefMatchItem {
  _id: string;
  displayValue: string;
}

export interface RefUniqueValue {
  searchText: string;
  matches: RefMatchItem[];
  exactMatch: boolean;
  rowIndices: number[];
  defaultAction: "use_existing" | "create";
  defaultMatchId: string | null;
}

export interface RefSearchAllResult {
  columnIndex: number;
  columnName: string;
  field: string;
  refEntity: string;
  displayLabel: string;
  single: boolean;
  isCompound?: boolean;
  compoundGroupId?: string;
  uniqueValues: RefUniqueValue[];
}

export interface RefResolution {
  action: "use_existing" | "create" | "skip";
  matchId?: string | null;
  matchLabel?: string | null;
}

export interface AutoLinkConfig {
  parentEntity: string;
  field: string;
  reverse?: boolean;
}

export interface FixedDescriptor {
  etiqueta: string;
  contenido: string;
}

export interface EntityImportConfig {
  entityName: string;
  label: string;
  fields: EntityField[];
  mappings: ColumnMapping[];
  actions: RowAction[];
  refResolutions: Record<string, Record<string, RefResolution>>;
  refResults: RefSearchAllResult[];
  validationResults: RowValidation[];
  autoLinks?: AutoLinkConfig[];
  compoundRefGroups?: CompoundRefGroup[];
  compoundObjectGroups?: CompoundObjectGroup[];
  fixedDescriptors?: FixedDescriptor[];
}

export interface ExecuteEntityPayload {
  entityName: string;
  mappings: ColumnMapping[];
  actions: RowAction[];
  refResolutions: Record<number, Record<string, RefResolution>>;
  autoLinks?: AutoLinkConfig[];
  compoundRefGroups?: CompoundRefGroup[];
  compoundObjectGroups?: CompoundObjectGroup[];
  fixedDescriptors?: FixedDescriptor[];
}

export interface ExecutePayload {
  columns: string[];
  rows: string[][];
  entities: ExecuteEntityPayload[];
}

export interface EntityResultGroup {
  entityName: string;
  results: ImportResult[];
  summary: ImportSummary;
}

export interface ExecuteResponse {
  results: ImportResult[];
  entityResults: EntityResultGroup[];
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

  dedup(payload: { columns: string[]; rows: string[][]; mappings: ColumnMapping[]; entityName: string }): Observable<{ success: boolean; data: RowValidation[] }> {
    return this.http.post<{ success: boolean; data: RowValidation[] }>(`${this.API}/dedup`, payload);
  }

  execute(payload: ExecutePayload): Observable<{ success: boolean; data: ExecuteResponse }> {
    return this.http.post<{ success: boolean; data: ExecuteResponse }>(`${this.API}/execute`, payload);
  }

  searchRef(entityName: string, searchText: string, excludedIds?: string[]): Observable<{ success: boolean; data: RefMatchItem[] }> {
    return this.http.post<{ success: boolean; data: RefMatchItem[] }>(`${this.API}/search-ref`, { entityName, searchText, excludedIds });
  }

  searchAllRefs(entityName: string, rows: string[][], mappings: ColumnMapping[], compoundRefGroups?: CompoundRefGroup[]): Observable<{ success: boolean; data: RefSearchAllResult[] }> {
    return this.http.post<{ success: boolean; data: RefSearchAllResult[] }>(`${this.API}/search-all-refs`, { entityName, rows, mappings, compoundRefGroups });
  }

  getRoles(): Observable<{ success: boolean; data: { elementos?: string[] } & Record<string, unknown> }> {
    return this.http.get<{ success: boolean; data: { elementos?: string[] } & Record<string, unknown> }>(`${environment.apiUrl}/listas/roles`);
  }

  getLista(nombreLista: string): Observable<{ success: boolean; data: { nombre_lista: string; elementos: string[] } }> {
    return this.http.get<{ success: boolean; data: { nombre_lista: string; elementos: string[] } }>(`${environment.apiUrl}/listas/${nombreLista}`);
  }
}
