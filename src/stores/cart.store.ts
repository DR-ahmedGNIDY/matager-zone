"use client";

/**
 * Zustand cart store.
 *
 * Responsibilities:
 * - Hold the cart state in memory on the client (avoids DB round-trips for every render)
 * - Optimistic updates: mutate local state immediately, then sync via server action
 * - The server action is the source of truth — on error we roll back
 */

import { create } from "zustand";
import type { CartWithItems } from "@/services/cart.service";

interface CartStore {
  cart: CartWithItems | null;
  itemCount: number;
  isLoading: boolean;

  // Setters called by server action results
  setCart: (cart: CartWithItems | null) => void;
  setItemCount: (count: number) => void;
  setLoading: (loading: boolean) => void;

  // Computed
  subtotalInCents: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  itemCount: 0,
  isLoading: false,

  setCart: (cart) => {
    const itemCount = cart
      ? cart.items.reduce((s, i) => s + i.quantity, 0)
      : 0;
    set({ cart, itemCount });
  },

  setItemCount: (itemCount) => set({ itemCount }),
  setLoading:   (isLoading)  => set({ isLoading }),

  subtotalInCents: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.product.priceInCents * item.quantity,
      0
    );
  },
}));
