// Título y meta description de las páginas públicas estáticas. Fuente única
// para el <Helmet> de cada página y para el Worker (worker/index.js), que los
// inyecta en el HTML crudo antes de que corra el JS. Sin dependencias ni
// import.meta.env: el Worker lo importa tal cual.
//
// /home y /stores también los usa el backend en /og/home y /og/stores
// (ecomerce-back/src/modules/og-preview/og-preview.controller.ts): si cambian
// aquí, cambiarlos allá también.
//
// Títulos: 50-60 caracteres, palabra clave al inicio y marca al final.
// Descripciones: 150-160 caracteres, con llamada a la acción.

export interface PageMeta {
  title: string;
  description: string;
}

export const PAGE_META = {
  '/bienvenida': {
    title: 'Vende en línea con tienda, inventario y POS — Merku',
    description:
      'Abre tu tienda online en Merku y gestiona inventario, pedidos, punto de venta y caja en una sola plataforma. Pagos directos, sin comisiones de pasarela.',
  },
  '/home': {
    title: 'Tiendas y restaurantes locales en Medellín — Merku',
    description:
      'Compra en tiendas y restaurantes locales de Medellín desde un solo lugar: pide a domicilio o recoge en tienda y paga por transferencia. Explora Merku.',
  },
  '/stores': {
    title: 'Directorio de tiendas locales en Medellín — Merku',
    description:
      'Conoce las tiendas y restaurantes locales de Medellín que venden en Merku: revisa su catálogo y ubicación y haz tu pedido a domicilio o para recoger.',
  },
  '/stores/map': {
    title: 'Mapa de tiendas locales cerca de ti — Merku',
    description:
      'Encuentra en el mapa las tiendas y restaurantes de Merku más cercanos a ti, traza la ruta para llegar y explora el catálogo de cada tienda antes de ir.',
  },
  '/ayuda': {
    title: 'Centro de ayuda: cómo comprar y vender — Merku',
    description:
      'Guías paso a paso para usar Merku: cómo explorar el catálogo, hacer un pedido, pagar por transferencia, seguir tus pedidos y guardar tus favoritos.',
  },
  '/terminos': {
    title: 'Términos y condiciones — Merku',
    description:
      'Consulta los términos y condiciones de uso de Merku, el marketplace de tiendas locales en Colombia: registro, pagos, derecho de retracto y disputas.',
  },
  '/privacidad': {
    title: 'Política de privacidad — Merku',
    description:
      'Conoce cómo Merku recopila, usa y protege tus datos personales conforme a la Ley 1581 de 2012 de Colombia, y cómo ejercer tus derechos como titular.',
  },
} satisfies Record<string, PageMeta>;

// "<producto> en <tienda> — Merku": el nombre de la tienda capta búsquedas de
// marca local. Se omite si el título pasaría de 60 caracteres (Google lo
// cortaría). Mantener igual a productTitle() de og-preview.controller.ts.
export const productPageTitle = (productName: string, storeName?: string | null): string => {
  const withStore = storeName ? `${productName} en ${storeName} — Merku` : null;
  return withStore && withStore.length <= 60 ? withStore : `${productName} — Merku`;
};
