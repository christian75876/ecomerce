import { ROUTES } from '@/shared/constants/routes';

// URLs de producto descriptivas: /product/<slug-del-nombre>-<uuid>.
// El uuid al final es el identificador real (el slug es decorativo); las URLs
// viejas /product/<uuid> siguen funcionando y se reemplazan por la canónica.
// Mantener en sync con ecomerce-back/src/common/utils/product-url.ts.

const UUID_AT_END =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');

export const buildProductPath = (id: string, name?: string | null): string => {
  const slug = name ? slugify(name) : '';
  return ROUTES.PUBLIC.PRODUCT_DETAILS.replace(':productId', slug ? `${slug}-${id}` : id);
};

/** Extrae el uuid del parámetro de ruta (con o sin slug delante). */
export const extractProductId = (param?: string): string | undefined => {
  if (!param) return undefined;
  const match = param.match(UUID_AT_END);
  return match ? match[1].toLowerCase() : param;
};
