'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FabricFamily, FitPreference } from '@prisma/client';

import { GarmentPreview } from '@/components/builder/garment-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/store/cart';
import { FIT_LABELS } from '@/lib/constants';
import { fabricImage } from '@/lib/swatches';
import { formatDate, formatMoney } from '@/lib/utils';

export type SavedDesign = {
  id: string;
  name: string;
  isDraft: boolean;
  /** True once the design is on an order — it can no longer be edited or deleted. */
  ordered: boolean;
  totalPriceKobo: number;
  updatedAt: string;
  baseStyleName: string;
  baseStyleSlug: string;
  fit: FitPreference;
  fabric: {
    name: string;
    family: FabricFamily;
    colorHex: string;
    swatchImage: string | null;
  };
  optionNames: string[];
};

export function SavedDesigns({ designs }: { designs: SavedDesign[] }) {
  const router = useRouter();
  const addToCart = useCart((s) => s.addItem);
  const [confirmDelete, setConfirmDelete] = React.useState<SavedDesign | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onDelete(design: SavedDesign) {
    setPending(true);
    try {
      const res = await fetch('/api/designs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: design.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? 'Could not delete that design.');

      toast.success('Design deleted');
      setConfirmDelete(null);
      router.refresh();
    } catch (error) {
      toast.error('Could not delete that', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  function onAdd(design: SavedDesign) {
    addToCart({
      kind: 'CUSTOM',
      customDesignId: design.id,
      name: `${design.baseStyleName} in ${design.fabric.name}`,
      descriptor: design.optionNames.slice(0, 3).join(' · '),
      imageUrl: fabricImage(design.fabric),
      unitPriceKobo: design.totalPriceKobo,
      href: `/builder?design=${design.id}`,
    });
    toast.success('Added to your bag');
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="eyebrow">Saved designs</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          Drafts can be reopened and changed. Once a design has been ordered it is locked, so the
          atelier is always working from what you actually bought.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => (
          <li key={design.id} className="flex flex-col border border-ink/12">
            <div className="aspect-[3/4] w-full bg-cream/40">
              <GarmentPreview
                showSeams={false}
                config={{
                  baseStyleSlug: design.baseStyleSlug,
                  fabric: design.fabric,
                  fit: design.fit,
                }}
              />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="flex flex-wrap items-start gap-2">
                <h3 className="min-w-0 flex-1 font-display text-[1.05rem] leading-snug text-ink">
                  {design.name}
                </h3>
                {design.ordered ? (
                  <Badge variant="emerald">Ordered</Badge>
                ) : design.isDraft ? (
                  <Badge>Draft</Badge>
                ) : null}
              </div>

              <p className="mt-1.5 text-xs text-ink-muted">
                {design.baseStyleName} · {design.fabric.name}
              </p>
              <p className="mt-0.5 text-xs text-ink-faint">{FIT_LABELS[design.fit]}</p>

              <p className="mt-3 font-display text-lg tabular-nums text-ink">
                {formatMoney(design.totalPriceKobo)}
              </p>
              <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint">
                Saved {formatDate(design.updatedAt)}
              </p>

              <div className="mt-auto flex items-center gap-2 pt-4">
                {design.ordered ? (
                  <Button asChild variant="outline" size="sm" full>
                    <Link href={`/builder?design=${design.id}`}>View</Link>
                  </Button>
                ) : (
                  <>
                    <Button size="sm" full onClick={() => onAdd(design)}>
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Add to bag
                    </Button>

                    <Button asChild variant="ghost" size="icon" aria-label="Edit this design">
                      <Link href={`/builder?design=${design.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    <button
                      type="button"
                      onClick={() => setConfirmDelete(design)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center text-ink-faint transition-colors hover:text-destructive"
                      aria-label={`Delete ${design.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this design?</DialogTitle>
            <DialogDescription>
              {confirmDelete?.name} will be removed for good. Your measurements are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => confirmDelete && onDelete(confirmDelete)}
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
