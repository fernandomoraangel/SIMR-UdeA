export interface NubeArchivo {
  _id: string;
  originalName: string;
  mimetype: string;
  size: number;
  key: string;
  tags: string[];
  uploadedBy?: { _id: string; username: string; fullName: string };
  createdAt: string;
  updatedAt: string;
}

export interface NubeArchivoListResponse {
  success: boolean;
  message: string;
  data: {
    files: NubeArchivo[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface TagCount {
  tag: string;
  count: number;
}
