import { useEffect, useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

const CART_KEY = 'public_cart';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) {
      return;
    }

    try {
      setItems(JSON.parse(stored) as CartItem[]);
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clear = () => setItems([]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    items,
    total,
    addItem,
    updateQuantity,
    clear,
  };
};
