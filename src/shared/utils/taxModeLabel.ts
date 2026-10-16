import type { ProductTaxMode } from '@/application/dtos/products/response/ProductResponse';

/** Etiqueta de IVA que acompaña al precio publicado. Con "+ IVA" el carrito
 * suma el impuesto al cobrar (ver shared/utils/tax.ts). */
export function taxModeLabel(taxMode?: ProductTaxMode | null, taxRate?: number | string | null): string | null {
  const rate = taxRate != null ? `${Number(taxRate)}%` : '';
  if (taxMode === 'INCLUDED') return 'IVA incluido';
  if (taxMode === 'EXCLUDED') return `+ IVA ${rate}`.trim();
  return null;
}
