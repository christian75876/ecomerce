/** Corta un texto a `max` caracteres y agrega "…" si se pasó — para evitar que
 * nombres muy largos hagan crecer tarjetas de tamaño fijo. */
export const truncateText = (text: string, max = 50): string =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
