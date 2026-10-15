/**
 * Serializa datos estructurados para un <script type="application/ld+json">.
 * Escapa "<" porque nombres y descripciones los escriben los vendedores: un
 * "</script>" literal cerraría el bloque e inyectaría HTML.
 */
export const serializeJsonLd = (data: object): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');

/** Recorta un texto para <meta name="description"> sin partir palabras. */
export const toMetaDescription = (text: string | null | undefined, fallback: string): string => {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  if (clean.length <= 155) return clean;
  const cut = clean.slice(0, 155);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`;
};
