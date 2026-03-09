import { create } from 'zustand';

export interface CartItem {
  product: string; // Product ID
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existingItem = state.items.find((i) => i.product === item.product);
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.product === item.product
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxStock) }
            : i
        ),
      };
    }
    return { items: [...state.items, item] };
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter((i) => i.product !== productId),
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.product === productId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
    ),
  })),
  clearCart: () => set({ items: [] }),
  total: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
