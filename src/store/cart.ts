'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * The cart lives entirely in the browser until checkout.
 *
 * Rationale: a made-to-measure basket is small (rarely more than two or three
 * pieces) and guests must be able to fill one without an account. Persisting
 * to localStorage keeps a half-finished order alive across a closed tab, which
 * matters when a customer is deciding on a ₦180,000 jacket. The Order row is
 * only created server-side at checkout, where prices are re-derived from the
 * database — the client is never trusted on price.
 */

export type CartItem = {
  /** Line id, unique per line — two identical designs can sit side by side. */
  id: string;
  kind: 'PRODUCT' | 'CUSTOM';
  /** Set for ready-to-shop pieces. */
  productId?: string;
  /** Set for configurator output; the design row is persisted server-side. */
  customDesignId?: string;
  name: string;
  descriptor?: string;
  imageUrl?: string;
  /** Kobo. Re-validated server-side at checkout — display only. */
  unitPriceKobo: number;
  quantity: number;
  href?: string;
  /** Frozen builder state, so the line survives a catalogue change. */
  designSnapshot?: unknown;
  measurementProfileId?: string | null;
  addedAt: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  /** False until the persisted state has been rehydrated on the client. */
  hydrated: boolean;

  addItem: (item: Omit<CartItem, 'id' | 'addedAt' | 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setHydrated: () => void;
};

function lineId() {
  return `line_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hydrated: false,

      addItem: (item) =>
        set((state) => {
          const quantity = Math.max(1, item.quantity ?? 1);

          // Ready-to-wear lines merge; custom designs never do, because each
          // one is cut to a specific set of measurements.
          if (item.kind === 'PRODUCT') {
            const existing = state.items.find(
              (i) => i.kind === 'PRODUCT' && i.productId === item.productId,
            );
            if (existing) {
              return {
                isOpen: true,
                items: state.items.map((i) =>
                  i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i,
                ),
              };
            }
          }

          return {
            isOpen: true,
            items: [...state.items, { ...item, quantity, id: lineId(), addedAt: Date.now() }],
          };
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity: Math.min(20, quantity) } : i,
                ),
        })),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'preeskahmour.cart.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }) as CartState,
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

// --- selectors ---------------------------------------------------------------

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.unitPriceKobo * i.quantity, 0);
