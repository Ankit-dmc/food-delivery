"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calculatePricing, type PricingBreakdown } from "@/lib/pricing";

export interface CartItem {
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number; // INR
  image: string;
  isVeg: boolean;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /** Add one unit of an item, or increment if it already exists. */
  addItem: (item: Omit<CartItem, "quantity">) => void;
  /** Set an absolute quantity; 0 (or less) removes the line. */
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
}

/**
 * Cart state persisted to localStorage.
 *
 * The store only holds display data + quantities. Totals are always derived
 * (see selectors below) so they can never drift out of sync with line items,
 * and the server independently recomputes the authoritative total when the
 * Razorpay order is created.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItemId === item.menuItemId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: Math.min(i.quantity + 1, 99) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      setQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.menuItemId !== menuItemId)
              : state.items.map((i) =>
                  i.menuItemId === menuItemId
                    ? { ...i, quantity: Math.min(Math.round(quantity), 99) }
                    : i
                ),
        })),

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "food-delivery-cart:v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only cart data is persisted — nothing sensitive belongs in localStorage.
      partialize: (state) => ({ items: state.items }),
    }
  )
);

/** Total number of units in the cart (for the navbar badge). */
export const selectCartCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

/** Live pricing preview for the cart / checkout UI. */
export const selectPricing = (state: CartState): PricingBreakdown =>
  calculatePricing(state.items);

/** Non-hook helper for event handlers that already read the store. */
export function getCartPricing(items: CartItem[]): PricingBreakdown {
  return calculatePricing(items);
}
