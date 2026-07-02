export const formatDate = (date: Date | string) => {
  return Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};
