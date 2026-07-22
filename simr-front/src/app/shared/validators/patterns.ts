export const PATTERNS = {
  url: /^https?:\/\/.+/i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  nombreMateria: /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]{2,}$/,
  simpleText: /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s\-_.,:;()]+$/,
};

export const ERROR_MESSAGES = {
  url: 'Debe ser una URL válida (https://...)',
  email: 'Debe ser un correo electrónico válido',
  simpleText: 'Contiene caracteres no permitidos',
};
