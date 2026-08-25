'use client';

import * as React from 'react';
import { Check, Search, X } from 'lucide-react';
import type { FabricFamily, Occasion } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FABRIC_FAMILY_LABELS,
  FABRIC_FAMILY_NOTES,
  OCCASION_LABELS,
  OCCASION_ORDER,
} from '@/lib/constants';
import { fabricImage } from '@/lib/swatches';
import type { FabricCard } from '@/lib/queries';
import { cn, formatMoney } from '@/lib/utils';

/**
 * Step 2 — the cloth.
 *
 * Filtering happens in memory: the whole in-stock catalogue was loaded with
 * the page, so narrowing by family or colour is instant and offline-safe.
 * This is the step people spend longest on, so it stays fast and nothing
 * about it round-trips.
 */
export function StepFabric({
  fabrics,
  selectedId,
  onSelect,
}: {
  fabrics: FabricCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [family, setFamily] = React.useState<FabricFamily | 'ALL'>('ALL');
  const [occasion, setOccasion] = React.useState<Occasion | 'ALL'>('ALL');
  const [color, setColor] = React.useState<string | 'ALL'>('ALL');
  const [query, setQuery] = React.useState('');

  const families = React.useMemo(
    () => [...new Set(fabrics.map((f) => f.family))],
    [fabrics],
  );

  const colors = React.useMemo(
    () => [...new Set(fabrics.flatMap((f) => f.colorTags))].sort(),
    [fabrics],
  );

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return fabrics.filter((fabric) => {
      if (family !== 'ALL' && fabric.family !== family) return false;
      if (occasion !== 'ALL' && !fabric.occasions.includes(occasion)) return false;
      if (color !== 'ALL' && !fabric.colorTags.includes(color)) return false;
      if (
        needle &&
        !`${fabric.name} ${fabric.colorName} ${fabric.origin ?? ''}`.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [fabrics, family, occasion, color, query]);

  const hasFilters = family !== 'ALL' || occasion !== 'ALL' || color !== 'ALL' || query !== '';

  function clear() {
    setFamily('ALL');
    setOccasion('ALL');
    setColor('ALL');
    setQuery('');
  }

  const selected = fabrics.find((f) => f.id === selectedId);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cloth by name, colour or origin"
          className="pl-10"
          aria-label="Search fabrics"
        />
      </div>

      {/* Family */}
      <FilterRow label="Family">
        <Chip active={family === 'ALL'} onClick={() => setFamily('ALL')}>
          All
        </Chip>
        {families.map((f) => (
          <Chip key={f} active={family === f} onClick={() => setFamily(f)}>
            {FABRIC_FAMILY_LABELS[f]}
          </Chip>
        ))}
      </FilterRow>

      {/* Colour */}
      {colors.length > 0 ? (
        <FilterRow label="Colour">
          <Chip active={color === 'ALL'} onClick={() => setColor('ALL')}>
            Any
          </Chip>
          {colors.map((c) => (
            <Chip key={c} active={color === c} onClick={() => setColor(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </Chip>
          ))}
        </FilterRow>
      ) : null}

      {/* Occasion */}
      <FilterRow label="Suits">
        <Chip active={occasion === 'ALL'} onClick={() => setOccasion('ALL')}>
          Anything
        </Chip>
        {OCCASION_ORDER.map((o) => (
          <Chip key={o} active={occasion === o} onClick={() => setOccasion(o)}>
            {OCCASION_LABELS[o]}
          </Chip>
        ))}
      </FilterRow>

      <div className="mb-5 mt-6 flex items-center justify-between gap-3 border-b border-ink/10 pb-3">
        <p className="text-xs text-ink-muted">
          {filtered.length} {filtered.length === 1 ? 'cloth' : 'cloths'}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint hover:text-ink"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-ink/20 p-8 text-center text-sm text-ink-muted">
          Nothing matches that. Loosen a filter — or ask us, we hold more on the shelf than is
          listed here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {filtered.map((fabric) => {
            const isSelected = fabric.id === selectedId;
            return (
              <button
                key={fabric.id}
                type="button"
                onClick={() => onSelect(fabric.id)}
                aria-pressed={isSelected}
                className={cn(
                  'group relative flex flex-col border text-left transition-all duration-300 ease-editorial',
                  isSelected
                    ? 'border-gold shadow-gold-ring'
                    : 'border-ink/12 hover:border-ink/40 hover:shadow-lift',
                )}
              >
                {isSelected ? (
                  <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center bg-gold text-ink">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                ) : null}

                <span
                  className="block aspect-square w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${fabricImage(fabric)}")` }}
                  aria-hidden
                />

                <span className="flex flex-1 flex-col p-3">
                  <span className="font-display text-[0.95rem] leading-snug text-ink">
                    {fabric.name}
                  </span>
                  <span className="mt-0.5 text-[0.7rem] text-ink-muted">{fabric.colorName}</span>
                  <span className="mt-2 text-xs tabular-nums text-ink">
                    {formatMoney(fabric.pricePerMeterKobo)}
                    <span className="text-ink-faint">/m</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail on the chosen cloth — the story is half the reason to buy it */}
      {selected ? (
        <div className="mt-8 border-t border-ink/10 pt-7">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="emerald">{FABRIC_FAMILY_LABELS[selected.family]}</Badge>
            {selected.origin ? <Badge>{selected.origin}</Badge> : null}
          </div>

          <h3 className="mt-4 font-display text-xl text-ink">{selected.name}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {selected.description ?? FABRIC_FAMILY_NOTES[selected.family]}
          </p>

          {selected.artisanNote ? (
            <p className="mt-3 max-w-2xl border-l-2 border-gold py-1 pl-4 text-sm leading-relaxed text-ink-muted">
              {selected.artisanNote}
            </p>
          ) : null}

          {selected.composition ? (
            <p className="mt-3 text-xs text-ink-faint">
              {selected.composition}
              {selected.gsm ? ` · ${selected.gsm} gsm` : ''}
              {selected.widthCm ? ` · ${selected.widthCm}cm wide` : ''}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="eyebrow mb-2">{label}</p>
      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 whitespace-nowrap border px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] transition-colors',
        active
          ? 'border-ink bg-ink text-ivory'
          : 'border-ink/20 text-ink-muted hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
