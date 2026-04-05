import { useSyncExternalStore } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

const CART_KEY = 'public_cart';
const CART_EVENT = 'cart-updated';

const readItems = (): CartItem[] => {
  const stored = localStorage.getItem(CART_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as CartItem[];
  } catch {
    localStorage.removeItem(CART_KEY);
    return [];
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
  const items = useSyncExternalStore(subscribe, readItems, () => []);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    const current = readItems();
    const existing = current.find((entry) => entry.productId === item.productId);

    if (existing) {
      writeItems(
        current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        ),
      );
      return;
    }

    writeItems([...current, { ...item, quantity: 1 }]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    writeItems(
      readItems()
        .map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clear = () => writeItems([]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    items,
    total,
    addItem,
    updateQuantity,
    clear,
  };
};
