'use client';

import * as React from 'react';
import { CartDrawer } from './cart-drawer';

/**
 * Mounts the cart drawer once, at the root, so any button anywhere on the
 * site can open it through the Zustand store without prop-drilling.
 *
 * The store itself is created outside React (see store/cart.ts) — this
 * component exists only to own the drawer's place in the tree.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
