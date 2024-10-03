export interface SharedMessageData {
  type: string;
  status?: string;
  message: string;
  // message: Record<string, any>; // JSON con claves string y valores de cualquier tipo
  // origen: 'Angular' | 'AngularJS';
}