import { useSyncExternalStore } from 'react';
import type { ProductTaxMode } from '@/application/dtos/products/response/ProductResponse';
import { computeLineTax, LineTax, summarizeTax } from '@/shared/utils/tax';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  storeId?: string;
  storeAddressText?: string | null;
  storeDeliveryOptions?: 'DELIVERY' | 'PICKUP' | 'BOTH';
  maxStock?: number;
  // Ausentes en carritos guardados antes del IVA: se tratan como sin IVA hasta
  // que el producto se vuelva a agregar. El cobro real lo calcula el backend.
  taxMode?: ProductTaxMode | null;
  taxRate?: number | string | null;
}

const CART_KEY = 'public_cart';
const CART_EVENT = 'cart-updated';
const EMPTY_ITEMS: CartItem[] = [];

let cachedRaw = '';
let cachedItems: CartItem[] = EMPTY_ITEMS;

const readItems = (): CartItem[] => {
  const stored = localStorage.getItem(CART_KEY);
  if (!stored) {
    cachedRaw = '';
    cachedItems = EMPTY_ITEMS;
    return cachedItems;
  }

  if (stored === cachedRaw) {
    return cachedItems;
  }

  try {
    const parsed = JSON.parse(stored) as CartItem[];
    cachedRaw = stored;
    cachedItems = Array.isArray(parsed) ? parsed : EMPTY_ITEMS;
    return cachedItems;
  } catch {
    localStorage.removeItem(CART_KEY);
    cachedRaw = '';
    cachedItems = EMPTY_ITEMS;
    return cachedItems;
  }
};

const writeItems = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
};

const subscribe = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener(CART_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(CART_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};

export const useCart = () => {
  const items = useSyncExternalStore(subscribe, readItems, () => EMPTY_ITEMS);

  const addItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    const current = readItems();
    const existing = current.find((entry) => entry.productId === item.productId);

    if (existing) {
      const cap = existing.maxStock ?? Infinity;
      if (existing.quantity >= cap) return;
      // Se refrescan precio e IVA con lo último que ve el comprador.
      writeItems(
        current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, ...item, quantity: Math.min(entry.quantity + qty, cap) }
            : entry,
        ),
      );
      return;
    }

    const cap = item.maxStock ?? Infinity;
    writeItems([...current, { ...item, quantity: Math.min(qty, cap) }]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    writeItems(
      readItems()
        .map((item) => {
          if (item.productId !== productId) return item;
          const capped = item.maxStock !== undefined ? Math.min(quantity, item.maxStock) : quantity;
          return { ...item, quantity: capped };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (productId: string) => {
    writeItems(readItems().filter((item) => item.productId !== productId));
  };

  const clear = () => writeItems([]);

  const lines: LineTax[] = items.map((item) =>
    computeLineTax(item.price, item.quantity, item.taxMode, item.taxRate),
  );
  // total = lo que paga el cliente (con IVA, antes de cupón); taxTotal = IVA contenido.
  const { total, taxTotal } = summarizeTax(lines);

  return {
    items,
    lines,
    total,
    taxTotal,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };
};
