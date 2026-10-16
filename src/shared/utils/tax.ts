import type { ProductTaxMode } from '@/application/dtos/products/response/ProductResponse';

/**
 * Copia de ecomerce-back/src/common/utils/tax.ts — solo para mostrar totales
 * en carrito y POS antes de confirmar. El valor cobrado lo calcula el backend;
 * si cambias la fórmula, cámbiala en ambos lados.
 */
export interface LineTax {
  unitPrice: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

export function computeLineTax(
  price: number | string,
  quantity: number,
  taxMode: ProductTaxMode | null | undefined,
  taxRate: number | string | null | undefined,
): LineTax {
  const basePrice = Number(price);
  const rate = taxMode ? Number(taxRate ?? 0) : 0;

  if (!taxMode || !(rate > 0)) {
    return { unitPrice: basePrice, lineTotal: round2(basePrice * quantity), taxRate: 0, taxAmount: 0 };
  }

  if (taxMode === 'EXCLUDED') {
    const unitPrice = Math.round(basePrice * (1 + rate / 100));
    const lineTotal = unitPrice * quantity;
    return { unitPrice, lineTotal, taxRate: rate, taxAmount: round2(lineTotal - basePrice * quantity) };
  }

  const lineTotal = round2(basePrice * quantity);
  return {
    unitPrice: basePrice,
    lineTotal,
    taxRate: rate,
    taxAmount: round2(lineTotal - lineTotal / (1 + rate / 100)),
  };
}

export function summarizeTax(lines: LineTax[], discountAmount = 0): { total: number; taxTotal: number } {
  const gross = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const tax = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const total = Math.max(0, round2(gross - discountAmount));
  const taxTotal = gross > 0 ? round2((tax * total) / gross) : 0;
  return { total, taxTotal };
}
