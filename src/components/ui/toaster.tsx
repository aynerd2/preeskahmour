'use client';

import { Toaster as Sonner } from 'sonner';

/** Toasts in house colours: ink ground, ivory text, gold rule on the left. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'border-l-2 border-l-gold !bg-ink !text-ivory !rounded-none !font-sans !text-sm !shadow-editorial',
          description: '!text-ivory/70',
          actionButton: '!bg-gold !text-ink !rounded-none',
          cancelButton: '!bg-transparent !text-ivory/60',
          error: '!border-l-terracotta',
          success: '!border-l-emerald-light',
        },
      }}
    />
  );
}
