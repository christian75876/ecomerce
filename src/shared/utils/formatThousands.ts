/** Formatea un valor numérico en texto con separador de miles (es-CO) mientras
 * se escribe en un input — usado en campos de precio/costo. */
export function formatThousands(raw: string): string {
  const n = raw.replace(/\D/g, '');
  if (!n) return '';
  return Number(n).toLocaleString('es-CO');
}
