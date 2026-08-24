'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type FilterGroup = {
  /** Query-string key, e.g. "occasion". */
  param: string;
  label: string;
  options: { value: string; label: string; hint?: string; swatch?: string }[];
};

/**
 * Shared multi-select filter rail for the shop and the fabric library.
 *
 * State lives entirely in the URL, so a filtered view is shareable, survives
 * a refresh and works with the back button. On mobile the same groups render
 * inside a bottom sheet — filters on a 375px screen must never eat the grid.
 */
export function FilterRail({
  groups,
  sort,
  resultCount,
  className,
}: {
  groups: FilterGroup[];
  /** Omit to hide the sort control (the fabric library has no price sort). */
  sort?: { param: string; options: { value: string; label: string }[]; defaultValue: string };
  resultCount: number;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const selected = React.useCallback(
    (param: string) => new Set(searchParams.getAll(param)),
    [searchParams],
  );

  const activeCount = groups.reduce((n, g) => n + searchParams.getAll(g.param).length, 0);

  function toggle(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(param);
    params.delete(param);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    for (const v of next) params.append(param, v);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === sort?.defaultValue) params.delete(sort.param);
    else params.set(sort!.param, value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
    setSheetOpen(false);
  }

  const groupsMarkup = (
    <div className="space-y-8">
      {groups.map((group) => {
        const active = selected(group.param);
        return (
          <fieldset key={group.param}>
            <legend className="eyebrow mb-3.5">{group.label}</legend>
            <ul className="space-y-2.5">
              {group.options.map((option) => {
                const id = `${group.param}-${option.value}`;
                const isActive = active.has(option.value);
                return (
                  <li key={option.value} className="flex items-start gap-3">
                    <Checkbox
                      id={id}
                      checked={isActive}
                      onCheckedChange={() => toggle(group.param, option.value)}
                      className="mt-0.5"
                    />
                    <label htmlFor={id} className="flex-1 cursor-pointer select-none">
                      <span
                        className={cn(
                          'flex items-center gap-2 text-sm leading-snug transition-colors',
                          isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                        )}
                      >
                        {option.swatch ? (
                          <span
                            className="h-3.5 w-3.5 shrink-0 border border-ink/15"
                            style={{ backgroundColor: option.swatch }}
                            aria-hidden
                          />
                        ) : null}
                        {option.label}
                      </span>
                      {option.hint ? (
                        <span className="mt-0.5 block text-xs leading-snug text-ink-faint">
                          {option.hint}
                        </span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>

        {sort ? (
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={searchParams.get(sort.param) ?? sort.defaultValue}
              onChange={(e) => setSort(e.target.value)}
              className="border border-ink/20 bg-ivory py-1.5 pl-2 pr-6 text-xs text-ink focus:border-emerald focus:outline-none"
            >
              {sort.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {/* Desktop rail */}
      <aside className={cn('hidden lg:block', className)} aria-label="Filters">
        <div className="mb-7 flex items-baseline justify-between gap-3">
          <p className="text-xs text-ink-muted">
            {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
          </p>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint hover:text-ink"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          ) : null}
        </div>

        {sort ? (
          <div className="mb-8">
            <p className="eyebrow mb-3.5">Sort</p>
            <div className="flex flex-col gap-2">
              {sort.options.map((option) => {
                const isActive =
                  (searchParams.get(sort.param) ?? sort.defaultValue) === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSort(option.value)}
                    className={cn(
                      'text-left text-sm transition-colors',
                      isActive ? 'text-ink underline decoration-gold underline-offset-4' : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {groupsMarkup}
      </aside>

      {/* Mobile sheet */}
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent side="bottom" className="max-h-[85vh] p-0">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-ivory px-5 py-4">
            <DialogTitle className="text-lg">Filter</DialogTitle>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="mr-10 text-[0.66rem] uppercase tracking-[0.14em] text-ink-faint"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="px-5 py-6">{groupsMarkup}</div>

          <div className="sticky bottom-0 border-t border-ink/10 bg-ivory p-4">
            <Button full size="lg" onClick={() => setSheetOpen(false)}>
              Show {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Chips showing what is currently filtered, above the grid. */
export function ActiveFilters({ groups }: { groups: FilterGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = groups.flatMap((group) =>
    searchParams.getAll(group.param).map((value) => ({
      param: group.param,
      value,
      label: group.options.find((o) => o.value === value)?.label ?? value,
    })),
  );

  if (active.length === 0) return null;

  function remove(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const next = params.getAll(param).filter((v) => v !== value);
    params.delete(param);
    for (const v of next) params.append(param, v);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <ul className="mb-8 flex flex-wrap gap-2">
      {active.map((chip) => (
        <li key={`${chip.param}-${chip.value}`}>
          <button
            type="button"
            onClick={() => remove(chip.param, chip.value)}
            className="inline-flex items-center gap-2 border border-ink/20 bg-cream px-3 py-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
          >
            {chip.label}
            <X className="h-3 w-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
