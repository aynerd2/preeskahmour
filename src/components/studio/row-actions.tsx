'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteButton } from './studio-ui';
import {
  deleteBaseStyle,
  deleteBlogPost,
  deleteCollection,
  deleteDesignOption,
  deleteFabric,
  deleteHomeTile,
  deleteLookbookImage,
  deleteProduct,
  deleteTestimonial,
  toggleFabricStock,
} from '@/app/studio/actions';

/**
 * Per-row controls in the studio lists.
 *
 * Each is a thin client wrapper around a server action. They live together so
 * the confirmation copy for "you cannot delete this because something depends
 * on it" stays consistent across models.
 */

export function FabricRowActions({
  id,
  name,
  inStock,
  inUse,
}: {
  id: string;
  name: string;
  inStock: boolean;
  inUse: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function toggle() {
    setPending(true);
    const result = await toggleFabricStock(id, !inStock);
    setPending(false);

    if (result.ok) {
      toast.success(inStock ? `${name} marked out of stock` : `${name} is back in stock`);
      router.refresh();
    } else {
      toast.error('Could not update that', { description: result.error });
    }
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="flex h-8 w-8 items-center justify-center text-ink-faint transition-colors hover:text-ink disabled:opacity-40"
        aria-label={inStock ? `Mark ${name} out of stock` : `Mark ${name} in stock`}
        title={inStock ? 'Mark out of stock' : 'Mark in stock'}
      >
        {inStock ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>

      <DeleteButton
        label={name}
        onDelete={() => deleteFabric(id)}
        description={
          inUse
            ? `${name} is used by existing products or designs, so it cannot be deleted — mark it out of stock instead.`
            : `${name} will be removed from the library and the builder.`
        }
      />
    </div>
  );
}

export function ProductRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton
        label={name}
        onDelete={() => deleteProduct(id)}
        description={`${name} will be removed from the shop. Pieces that appear on past orders cannot be deleted — set them inactive instead.`}
      />
    </div>
  );
}

export function CollectionRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton
        label={name}
        onDelete={() => deleteCollection(id)}
        description={`${name} will be removed. Products and lookbook images in it are kept — they simply lose the grouping.`}
      />
    </div>
  );
}

export function BaseStyleRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton
        label={name}
        onDelete={() => deleteBaseStyle(id)}
        description={`${name} will be removed from the builder. Cuts used by existing designs cannot be deleted — set them inactive instead.`}
      />
    </div>
  );
}

export function DesignOptionRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton
        label={name}
        onDelete={() => deleteDesignOption(id)}
        description={`${name} will be removed from the builder. Options chosen on existing designs cannot be deleted — set them inactive instead.`}
      />
    </div>
  );
}

export function BlogPostRowActions({ id, title }: { id: string; title: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton
        label={title}
        onDelete={() => deleteBlogPost(id)}
        description={`"${title}" will be deleted permanently. To take it off the site without losing it, set it back to Draft instead.`}
      />
    </div>
  );
}

export function LookbookRowActions({ id, caption }: { id: string; caption: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton label={caption || 'this image'} onDelete={() => deleteLookbookImage(id)} />
    </div>
  );
}

export function TestimonialRowActions({ id, name }: { id: string; name: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton label={`the quote from ${name}`} onDelete={() => deleteTestimonial(id)} />
    </div>
  );
}

export function HomeTileRowActions({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex justify-end">
      <DeleteButton
        label={`the ${label} tile`}
        onDelete={() => deleteHomeTile(id)}
        description="The tile will be removed from the homepage. Nothing else changes."
      />
    </div>
  );
}
