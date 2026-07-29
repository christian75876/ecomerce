const TZ = 'America/Bogota';

export const formatDate = (date: Date | string) =>
  Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: TZ,
  }).format(new Date(date));

export const formatDateOnly = (date: Date | string) =>
  Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(date));

export const formatDateShort = (date: Date | string) =>
  Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: TZ,
  }).format(new Date(date));
