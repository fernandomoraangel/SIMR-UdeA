export interface FileBasicInfo {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
}

export interface FileDeleteInfo {
  fileName: string;
  id: string;
  documentId?: string;
}

export interface FileDocumentInfo {
  id: string;
  name: string;
  documentId: string;
}

export interface SelectedFileInfo {
  id: string;
  [key: string]: string;
}

export interface SharedMessageData {
  type: string;
  status?: string;
  message: string;
  // message: Record<string, any>; // JSON con claves string y valores de cualquier tipo
  // origen: 'Angular' | 'AngularJS';
}
