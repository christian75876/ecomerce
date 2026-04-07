export const formatCurrencyCOP = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(Number.isFinite(amount) ? amount : 0)
    .replace('COP', '$')
    .replace(/\s+/g, ' ')
    .trim();
};
